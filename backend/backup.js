const { exec } = require('child_process');

function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const jsonOutput = `backup_${timestamp}.json`;
    const bsonOutput = `backup_${timestamp}.bson`;
    const compressedOutput = `backup_${timestamp}.tar.gz`;

    // Export to JSON and BSON
    exec(`mongodump --out ./backup --gzip`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during backup: ${error}`);
            return;
        }
        console.log(`Backup completed: ${stdout}`);

        // Compress the output to .tar.gz
        exec(`tar -czvf ${compressedOutput} ./backup`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error compressing backup: ${error}`);
                return;
            }
            console.log(`Backup compressed: ${stdout}`);
        });
    });
}

backupDatabase();