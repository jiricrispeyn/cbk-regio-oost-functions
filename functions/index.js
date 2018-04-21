const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const cheerio = require('cheerio')

admin.initializeApp()

exports.addresses = functions.https.onRequest((req, res) => {
  getAddresses(req.body.division).then(
    response => {
      const $ = cheerio.load(response)
      let addresses = []

      $('.adressentbl tr').each(function (i, elem) {
        let row = {}

        $(this).find('.even, .odd').each(function (j, elem) {
          let key

          switch (j) {
            case 0: key = 'club'
              break
            case 1: key = 'place'
              break
            case 2: key = 'address'
              break
            case 3: key = 'phone'
              break
          }

          if (key) {
            row[key] = $(this).text()
          }
        })

        if (row.hasOwnProperty('club')) {
          addresses.push(row)
        }
      })

      return res.status(200).send(addresses)
    },
    error => res.status(500).send('Internal Server Error')
  ).catch(
    error => res.status(500).send('Internal Server Error')
  )
});

function getAddresses(divison) {
  return axios({
    method: 'get',
    url: `http://cbkregio-oost.be/index.php?page=adressen&afdeling=${divison}`,
    responseType: 'document'
  }).then(
    response => response.data,
    error => error
  ).catch(error => error)
}