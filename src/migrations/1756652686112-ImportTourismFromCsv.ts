import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';

export class ImportTourismFromCsv1756650298107 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const csvPath = path.join(__dirname, '../../data/tourism.csv');
    let csvContent: string;
    try {
      csvContent = fs.readFileSync(csvPath, 'utf-8');
    } catch (err) {
      console.error(
        `Error reading CSV file at ${csvPath}: ${err.message || err}`,
      );
      throw new Error('Migration aborted: Unable to read tourism.csv file.');
    }

    const lines = csvContent.split('\n').filter((line) => line.trim() !== '');
    const headers = lines[0].split(',');

    const tourisms = [];

    for (let i = 1; i < lines.length; i++) {
      const val = this.parseCSVLine(lines[i]);
      if (val.length >= 3) {
        tourisms.push({
          address: val[0]?.trim() || '',
          province: val[1]?.trim() || '',
          region: val[2]?.trim() || '',
        });
      }
    }
    const batchSize = 50;
    for (let i = 0; i < tourisms.length; i += batchSize) {
      const batch = tourisms.slice(i, i + batchSize);
      const val = batch
        .map(
          (tourism) =>
            `('${this.escapeString(tourism.address)}', '${this.escapeString(tourism.province)}', '${this.escapeString(tourism.region)}', now(), now())`,
        )
        .join(', ');
      await queryRunner.query(
        `INSERT INTO tourisms (address, province, region, created_at, updated_at) VALUES ${val}`,
      );
    }
    console.log(`Imported ${tourisms.length} tourism from CSV`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM tourisms');
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
