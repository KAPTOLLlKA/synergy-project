const {By, Builder} = require("selenium-webdriver");
const pg = require('pg')
require("chromedriver");

const client = new pg.Client({
    host: 'postgres-5084.postgresql.a.osc-fr1.scalingo-dbs.com',
    port: 30661,
    database: 'postgres_5084',
    user: 'postgres_5084',
    password: '9NOUJokMT2VfJ8zaxMeQ'
})

async function main() {
    // Подключиться к базе данных в облаке
    await client.connect(err => {
        if (err) console.log('Failed', err)
        else console.log('Success')
    })

    // Инициировать драйвер браузера
    let driver = await new Builder().forBrowser("chrome").build();

    // Открыть сайт РБК
    await driver.get("https://rbc.ru");

    // Найти главную новость
    let topNews = await driver
        .findElement(By.className("main__big__title"))
        // И получить её название
        .then(topNewsSpan => topNewsSpan.getText())

    // Найти список новостей на главной странице
    let top = await driver
        .findElements(By.className("main__feed__title"))
        .then(headlineSpans => {
            // И получить названия этих новостей
            let headlines = []
            for (const headlineSpan of headlineSpans) {
                headlines.push(headlineSpan.getText())
            }
            return Promise.all(headlines)
        })

    // Положить главную новость и список новостей с главной страницы в базу в облаке
    await client.query(
        'INSERT INTO news (top_news, top) VALUES (?, ?)',
        [topNews, top],
        err => {
            if (!err) {
                console.log("Inserted top news")
            }
        }
    )

    // Отключить драйвер и подключение к базе данных
    await driver.quit();
    await client.end()
}

main().then(() => console.log("Success"))