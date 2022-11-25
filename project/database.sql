CREATE TABLE news
(
    date DATE NOT NULL DEFAULT NOW() PRIMARY KEY,
    top_news VARCHAR,
    top json
)