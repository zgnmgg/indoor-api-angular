import fs from 'fs';
import csvParser from './../shared/csv.parser';
import {ChokePoint} from '../models/choke-point.model';

describe('CSV File Parsing', () => {
  it('Parse an csv data', async (done) => {
    expect(fs.existsSync(`files/chokepoints.csv`)).toBeTruthy();
    fs.copyFileSync(`files/chokepoints.csv`, `tmp/uploads/chokepoints.csv`);

    const res = await csvParser<ChokePoint>(`tmp/uploads/chokepoints.csv`);

    expect(res).toHaveLength(3);
    const [first, second, third] = res;
    expect(first!.name).toBeTruthy();
    expect(first!.name).toEqual('CSV ChokePoint 1');
    expect(second!.name).toBeTruthy();
    expect(second!.name).toEqual('CSV ChokePoint 2');
    expect(third!.name).toBeTruthy();
    expect(third!.name).toEqual('CSV ChokePoint 3');

    // Delete temp file
    await fs.rmdirSync(`tmp/uploads/chokepoints.csv`, {recursive: true});

    done();
  });
});
