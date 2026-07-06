export default async function handler(req, res) {
    // Ждем параметр 'q' (кусок названия города, который вводит пользователь)
    const { q } = req.query;
    const WeatherAPIKey = process.env.SearchAPIKey; // Ключ от WeatherAPI

    // Если ничего не передали или запрос слишком короткий
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: "Query string 'q' must be at least 2 characters long" });
    }

    // URL для метода Search/Autocomplete у WeatherAPI
    const url = `https://api.weatherapi.com/v1/search.json?key=${WeatherAPIKey}&q=${encodeURIComponent(q)}`;

    try {
        const apiResponse = await fetch(url);
        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            return res.status(apiResponse.status).json({ error: data.error?.message || "WeatherAPI Error" });
        }

        // WeatherAPI сам по себе возвращает массив объектов вида:
        // [ { id, name, region, country, lat, lon, url }, ... ]
        // Можно отдать его "как есть" или отфильтровать только нужное:
        const suggestions = data.map(item => ({
            id: item.id,
            city: item.name,
            region: item.region,
            country: item.country,
            // lat и lon пригодятся, чтобы потом по ним запрашивать точную погоду
            lat: item.lat, 
            lon: item.lon 
        }));

        return res.status(200).json(suggestions);

    } catch (error) {
        console.error("Ошибка при поиске городов:", error);
        return res.status(500).json({ error: "Ошибка сервера при поиске" });
    }
}