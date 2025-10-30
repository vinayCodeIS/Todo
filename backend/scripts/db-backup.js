const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'todoApplication.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function backup() {
    const db = new sqlite3.Database(DB_PATH);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `todo-backup-${timestamp}.sql`);
    
    console.log('Starting database backup...');
    
    // Get all table schemas
    db.all("SELECT sql FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error('Error getting table schemas:', err);
            return db.close();
        }

        let backupSQL = tables.map(table => table.sql).join(';\n\n') + ';\n\n';

        // Get all data
        db.all("SELECT * FROM todo", [], (err, rows) => {
            if (err) {
                console.error('Error getting data:', err);
                return db.close();
            }

            // Generate INSERT statements
            rows.forEach(row => {
                backupSQL += `INSERT INTO todo (id, todo, priority, status, category, due_date) VALUES (
                    ${row.id},
                    '${row.todo.replace(/'/g, "''")}',
                    '${row.priority}',
                    '${row.status}',
                    '${row.category}',
                    '${row.due_date}'
                );\n`;
            });

            // Write backup file
            fs.writeFileSync(backupFile, backupSQL);
            console.log(`Backup created successfully: ${backupFile}`);
            db.close();
        });
    });
}

function restore(backupFile) {
    if (!backupFile) {
        // Get most recent backup
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('todo-backup-'))
            .sort()
            .reverse();
        
        if (backups.length === 0) {
            console.error('No backup files found!');
            return;
        }
        backupFile = path.join(BACKUP_DIR, backups[0]);
    }

    const db = new sqlite3.Database(DB_PATH);
    console.log(`Restoring from backup: ${backupFile}`);

    const sql = fs.readFileSync(backupFile, 'utf-8');
    
    // Run all statements in a transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run('DROP TABLE IF EXISTS todo');
        
        sql.split(';\n').forEach(statement => {
            if (statement.trim()) {
                db.run(statement, err => {
                    if (err) console.error('Error executing:', statement, err);
                });
            }
        });
        
        db.run('COMMIT', err => {
            if (err) {
                console.error('Error committing transaction:', err);
                db.run('ROLLBACK');
            } else {
                console.log('Restore completed successfully!');
            }
            db.close();
        });
    });
}

// Check command line arguments
const action = process.argv[2];
const backupFile = process.argv[3];

if (action === 'backup') {
    backup();
} else if (action === 'restore') {
    restore(backupFile);
} else {
    console.log('Usage: node db-backup.js [backup|restore] [backup-file-path]');
    console.log('Examples:');
    console.log('  node db-backup.js backup              # Create new backup');
    console.log('  node db-backup.js restore            # Restore from most recent backup');
    console.log('  node db-backup.js restore ./path.sql # Restore from specific file');
}