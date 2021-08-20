const fs = require('fs');
const util = require('util');
const readDir = util.promisify(fs.readdir).bind(fs);
const path = require('path');
const mongoose = require('mongoose');

/**
 * Convert first char or string
 * @param {string} str
 * @return {string}
 */
const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1);
  });
};

/**
 * Seed required models using predefine files
 * @param {string[]} seedModels
 */
export default async function seedDatabase(seedModels: string[] = []) {
  const dir: string[] = await readDir(__dirname);
  const seedFiles = dir.filter((f) => f.endsWith('.seed.ts'));

  for (const file of seedFiles) {
    const fileName: string = file.split('.seed.ts')[0];
    if (seedModels.includes(fileName)) {
      const modelName = toTitleCase(fileName);
      const model = mongoose.models[modelName];
      if (!model) throw new Error(`Cannot find Model '${modelName}'`);

      const seed = await import(path.join(__dirname, file));
      await seed.default();
    }
  }
}

