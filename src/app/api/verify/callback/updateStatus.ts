export async function updateStatus(id: String, status: String) {
    const baseUrl = process.env.BASE_URL || ""
    fetch(`${baseUrl}/verify/updateStatus`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: id,
            state: status
        })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}