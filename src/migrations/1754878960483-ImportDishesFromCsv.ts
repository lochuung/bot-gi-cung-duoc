import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from "typeorm";

export class ImportDishesFromCsv1754878960483 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Read CSV file
        const csvPath = path.join(__dirname, '../../data/dishes.csv');
        let csvContent: string;
        try {
            csvContent = fs.readFileSync(csvPath, 'utf-8');
        } catch (error) {
            console.error(`Error reading CSV file at ${csvPath}: ${error.message || error}`);
            throw new Error('Migration aborted: Unable to read dishes.csv file.');
        }

        // Parse CSV content
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',');

        // Prepare insert values
        const dishes = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length >= 4) {
                dishes.push({
                    name: values[0]?.trim() || '',
                    province: values[1]?.trim() || '',
                    region: values[2]?.trim() || '',
                    category: values[3]?.trim() || '',
                });
            }
        }

        // Insert dishes in batches
        const batchSize = 50;
        for (let i = 0; i < dishes.length; i += batchSize) {
            const batch = dishes.slice(i, i + batchSize);
            const values = batch.map(dish =>
                `('${this.escapeString(dish.name)}', '${this.escapeString(dish.province)}', '${this.escapeString(dish.region)}', '${this.escapeString(dish.category)}', now(), now())`
            ).join(', ');

            await queryRunner.query(`
                INSERT INTO dishes (name, province, region, category, created_at, updated_at) 
                VALUES ${values}
            `);
        }

        console.log(`Imported ${dishes.length} dishes from CSV`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DELETE FROM dishes');
    }

    private parseCSVLine(line: string): string[] {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    private escapeString(str: string): string {
        return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
    }

}
