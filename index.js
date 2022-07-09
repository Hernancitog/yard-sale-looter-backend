const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio');


// EXPRESS API
const APP_PORT = 3000
const app = express()

app.listen(APP_PORT, () => {
  console.log('Server started...');
})

app.get('/parse/yss', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    
    scrapeYSS().then(result => {
        // console.log('sales scraped: ' + JSON.stringify(result) )
        res.send(result)
        // res.send(JSON.stringify(result) )
    })
})



// YardSaleSearch (YSS)
const week = 1
const date = 0
const zip = 33707
const radius = 50
const keyword_query = ''
const YSS_URL = `https://www.yardsalesearch.com/garage-sales.html?week=${week}&date=${date}&zip=${zip}&r=${radius}&q=${keyword_query}`

function scrapeYSS() {
  console.log('Querying ' + YSS_URL)
  return axios.get(YSS_URL)
      .then(response => {
          const html = response.data
          console.log('Parsing response...')
          const $ = cheerio.load(html)
  
          const events = $('.box.radius.clearfix > .eventList.clearFix > .event.row', html)
          const sales = parseYSSSales($, events)

          return sales
      })
      .catch(error => {
          console.error(error)
      })
    
}

function parseYSSSales($, events) {
    const yardsales = []
    var count = 0

    events.each((index, element) => {
        const saleDetails = $(element).find('.sale-details')

        const name = saleDetails.find('h2[itemprop=name]').text()
        const address = saleDetails.find('div[itemprop=address]').text()
        const latitude = saleDetails.find('meta[itemprop=latitude]').attr('content')
        const longitude = saleDetails.find('meta[itemprop=longitude]').attr('content')
        const startDate = saleDetails.find('meta[itemprop=startDate]').attr('content')
        const endDate = saleDetails.find('meta[itemprop=endDate]').attr('content')

        yardsales.push({
            name,
            address,
            latitude,
            longitude,
            startDate,
            endDate
        })
        count++
    })

    console.log(count + ' yardsale(s) parsed')
    // console.log(yardsales[0] )
    return yardsales
}
