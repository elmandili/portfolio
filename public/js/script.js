const baseUrl = 'http://localhost:3000/';

async function getActive() {
    try {
        const res = await fetch(baseUrl + "active", { method: 'GET' });
        const data = await res.json(); // Parse the JSON response
        console.log(data.active); // Log the parsed data
        document.getElementById(data.active).classList.add('active');
    } catch (error) {
        console.error('Error fetching active data:', error);
    }
}


getActive();