const Stream = require('stream');
const Promise = require('bluebird');
const fs = require('fs');
const generate = require('./generators.js');

const openInput = (start, stop) => {
  // console.log(start, stop);
  return new Stream.Readable({
    read() {
      let restaurantId = start;
      let batched = '';
      while (restaurantId <= stop) {
        const categories = generate.categories();
        for (let itemId = 0; itemId <= generate.int(5, 15); itemId++) {
          batched += generate.item({ itemId, restaurantId, categories });
        }
        if (restaurantId % 1000 === 0) { 
          console.log(restaurantId);
        }
        // if (restaurantId % 10000 === 0) {
        //   this.push(batched);
        //   batched = '';
        // }
        restaurantId++;
      }
      // console.log(`FINISHED ${start} TO ${stop}`);
      this.push(batched);
      this.push(null);
    },
  });
};

const openOutput = (number) => {
  if (number % 250 !== 0) { //If not multiple of 100, append to current file
    const current = Math.floor(number / 250);
    return fs.createWriteStream(`./data${current}.csv`, { flags: 'a' });
  }
  return fs.createWriteStream(`./data${number / 250}.csv`);
  // return fs.createWriteStream(`./dataS.csv`);
};

const openPipe = (loop, size) => {
  const [start, stop] = [loop * size + 1, (loop + 1) * size];
  const input = openInput(start, stop);
  const output = openOutput(loop);
  input.pipe(output);
  return new Promise((resolve, reject) => {
    output.on('finish', () => {
      resolve(`FINISHED ${start} TO ${stop}`);
    });
    output.on('error', reject);
  });
};

async function generateCsv(count, size) {
  for (let i = 0; i < count; i++) {
    const response = await openPipe(i, size);
    // console.log('RESULTS FROM PIPE', response);
  }
}

generateCsv(1000, 10000);
