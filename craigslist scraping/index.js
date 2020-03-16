const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs');

const url = 'https://sfbay.craigslist.org/d/admin-office/search/ofc';

const scrapeSample = {
  title: 'Hello',
  description: 'my decs',
  datePosted: new Date('2018-7-7'),
  url: 'http://google.com',
  hood: '(Soma)',
  address: 'sadfads',
  compensation: '23/hr'
};
const scrapeResults = [];
async function scrapeJobHeader() {
  try {
    const htmlRequest = await request.get(url);
    const $ = await cheerio.load(htmlRequest);

    $('.result-info').each((index, el) => {
      const resultTitle = $(el).children('.result-title');
      const title = resultTitle.text();
      const url = resultTitle.attr('href');
      const datePosted = $(el)
        .children('time')
        .attr('datetime');
      const hood = $(el)
        .find('.result-hood')
        .text();
      const scrapResult = { title, url, datePosted, hood };
      scrapeResults.push(scrapResult);
    });
    return scrapeResults;
    // console.log(scrapeResults);
    // console.log(htmlRequest);
  } catch (error) {
    console.log(error);
  }
}

async function scrapeDescription(jobsWithHeaders) {
  return await Promise.all(
    jobsWithHeaders.map(async job => {
      const htmlRequest = await request.get(job.url);
      const $ = await cheerio.load(htmlRequest);
      $('.print-qrcode-container').remove();
      job.description = $('#postingbody').text();
      job.address = $('div.mapaddress').text();
      const compensationText = $('p.attrgroup > span')
        .first()
        .text();
      job.compensation = compensationText.replace('compensation: ', '');
      return job;
    })
  );
}

async function scrapeCraigslist() {
  const jobsWithHeaders = await scrapeJobHeader();
  const jobsFullData = await scrapeDescription(jobsWithHeaders);
  fs.writeFileSync('./jobs.json', JSON.stringify(jobsFullData));
  console.log(jobsFullData);
}
scrapeCraigslist();

//  -------------------------------------------------------
// $('.result-info').each((index, el) => {
//   console.log(
//     $(el)
//       .children('.result-title')
//       .text()
//   );
// });
