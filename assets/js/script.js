document.addEventListener('DOMContentLoaded', () => {
    const inputAmount = document.getElementById('inputAmount');
    const currencySelect = document.getElementById('currencySelect');
    const resultDiv = document.getElementById('result');
    const convertButton = document.getElementById('convertButton');
    const canvas = document.getElementById('myChart');
    let myChart;

    async function fetchCurrencyData(currency) {
        try {
            const res = await fetch(`https://mindicador.cl/api/${currency}`);
            if (!res.ok) {
                throw new Error('Error al obtener los datos de la API');
            }
            const data = await res.json();
            return data.serie.slice(0, 10).reverse();  // últimos 10 días
        } catch (error) {
            console.error('Error al obtener datos:', error);
            resultDiv.textContent = 'Error al obtener los datos de la API. Intente nuevamente más tarde.';
            throw error;
        }
    }

    async function getAndCreateDataToChart(currency) {
        try {
            const dataPoints = await fetchCurrencyData(currency);
            const labels = dataPoints.map(point => new Date(point.fecha).toLocaleDateString('es-CL'));
            const data = dataPoints.map(point => point.valor);

            return {
                labels,
                datasets: [{
                    label: `Valor del ${currency.charAt(0).toUpperCase() + currency.slice(1)}`,
                    borderColor: "rgb(255, 99, 132)",
                    data
                }]
            };
        } catch (error) {
            console.error('Error al crear datos para el gráfico:', error);
            throw error;
        }
    }

    async function renderGrafica(currency) {
        try {
            const data = await getAndCreateDataToChart(currency);
            const config = {
                type: 'line',
                data
            };
            const ctx = canvas.getContext('2d');

            if (myChart) {
                myChart.destroy();
            }

            canvas.style.backgroundColor = "#f5f5dc"; // Cambia el fondo del canvas a color crema cuando se renderiza el gráfico
            myChart = new Chart(ctx, config);
        } catch (error) {
            console.error('Error al renderizar el gráfico:', error);
        }
    }

    function convertCurrency(amount, rate) {
        return (amount / rate).toFixed(2);
    }

    async function updateResult() {
        try {
            const amount = parseFloat(inputAmount.value);
            const currency = currencySelect.value;

            if (!amount || !currency) {
                resultDiv.textContent = 'Ingrese un monto válido y seleccione una moneda.';
                return;
            }

            const dataPoints = await fetchCurrencyData(currency);
            const latestRate = dataPoints[0].valor;
            const convertedAmount = convertCurrency(amount, latestRate);

            resultDiv.textContent = `Equivalente en ${currency.charAt(0).toUpperCase() + currency.slice(1)}: $${convertedAmount}`;
            renderGrafica(currency);
        } catch (error) {
            console.error('Error al actualizar el resultado:', error);
        }
    }

    convertButton.addEventListener('click', updateResult);
    currencySelect.addEventListener('change', updateResult);
});
