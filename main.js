// Add JS here
var productsRaw = null;
var products = null;
var analogPinsNeeded = 0;
var digitalPinsNeeded = 0;
var sensorsSubTotalAmount = 0;
var total = 0;
var includeArduinoUnoCaseInPrice = false;
var arduinoBoard = null;
var arduinoQtty = 1;

document.addEventListener("DOMContentLoaded", async function () {
    productsRaw = await fetch("./products.json");
    products = await productsRaw.json();

    products.sensors.forEach((sensor, index) => {
        let tableContainer = document.getElementById('sensorTableBody');
        let template = `
        <tr>
            <td>${sensor.name}</td>
            <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            sensor.price,
        )}</td>
            <td><input type="number" min="0" step="1"  placeholder="0" id="sensor${index}" onchange="calculateSubtotal(${index});" /></td>
            <td><span class="sensorSubtotalPrice" id="subtotal${index}"></span></td>
        </tr>`
        tableContainer.innerHTML += template;
    });
});

function calculateSubtotal(productIndex) {
    let productQuantity = document.getElementById(`sensor${productIndex}`).value;
    let productPrice = products.sensors[productIndex].price;
    let subtotal = productQuantity * productPrice;

    document.getElementById(`subtotal${productIndex}`).innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        subtotal,
    );

    calculateSensorsSubTotalAmount();
}

function calculateSensorsSubTotalAmount() {
    let inputArray = Array.from(document.getElementsByClassName("sensorSubtotalPrice"));
    let pricesArray = [];
    inputArray.forEach((inputString) => {
        pricesArray.push(Number(inputString.innerText.substring(3).replace(",", ".")));
    });
    sensorsSubTotalAmount = pricesArray.reduce((acc, curr) => acc + Number(curr));

    document.getElementById("sensorsSubTotalAmount").innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sensorsSubTotalAmount);

    calculateNeededArduino();
}

function calculateNeededArduino() {
    analogPinsNeeded = 0;
    digitalPinsNeeded = 0;
    let inputArray = Array.from(document.getElementsByTagName("input"));
    let productsQttyArray = inputArray.map((input) => Number(input.value));
    products.sensors.forEach((product, index) => {
        analogPinsNeeded += product.analogPins * productsQttyArray[index]
        digitalPinsNeeded += product.digitalPins * productsQttyArray[index]
    })
    analogPinsNeeded += Number(document.getElementById("analogOutputs").value);
    digitalPinsNeeded += Number(document.getElementById("digitalOutputs").value);

    let sortedBoardsByPrice = products.boards.sort((a, b) => a.price - b.price);

    arduinoQtty = 1;
    includeArduinoUnoCaseInPrice = document.getElementById("includeArduinoUnoCaseInPrice").checked;

    do {
        arduinoBoard = sortedBoardsByPrice.filter((board) => {
            if (includeArduinoUnoCaseInPrice) {
                return board.analogPorts * arduinoQtty >= analogPinsNeeded && board.digitalPorts * arduinoQtty >= digitalPinsNeeded && board.name == "Arduino UNO";
            } else {
                return board.analogPorts * arduinoQtty >= analogPinsNeeded && board.digitalPorts * arduinoQtty >= digitalPinsNeeded;
            }
        })
        if (arduinoBoard.length == 0) arduinoQtty++;
    } while (arduinoBoard.length == 0)
    calculateTotal();
}

function calculateTotal() {
    total = 0;
    document.getElementById('arduinoTableBody').innerHTML = "";

    let template = 
    `<tr>
        <td>
            ${arduinoBoard[0].name}
            </td>
            <td>
            ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(arduinoBoard[0].price)}
        </td>
        <td>
            ${arduinoQtty}
        </td>
        <td>
            ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(arduinoBoard[0].price * arduinoQtty)}
        </td>
    </tr>`;
    total += arduinoBoard[0].price * arduinoQtty;

    if (includeArduinoUnoCaseInPrice) {
        let arduinoCase = products.accessories.filter((product) => {
            return product.name === "Case para Arduino UNO";
        });
        template += 
        `<tr>
            <td>
                ${arduinoCase[0].name}
            </td>
            <td>
                ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(arduinoCase[0].price)}
            </td>
            <td>
                ${arduinoQtty}
            </td>
            <td>
                ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(arduinoCase[0].price * arduinoQtty)}
            </td>    
        </tr>`;
        total += arduinoCase[0].price * arduinoQtty;
    }
    
    let acAdapter = products.accessories.filter((product) => {
        return product.name === "Fonte chaveada 9V 1A plug P4";
    })
    template += 
        `<tr>
            <td>
                ${acAdapter[0].name}
            </td>
            <td>
                ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acAdapter[0].price)}
            </td>
            <td>
                ${arduinoQtty}
            </td>
            <td>
                ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acAdapter[0].price * arduinoQtty)}
            </td>    
        </tr>`;
    total += acAdapter[0].price * arduinoQtty;

    document.getElementById('arduinoTableBody').innerHTML = template;
    
    total += sensorsSubTotalAmount;
    document.getElementById("totalAmount").innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);

    document.getElementById('neededArduinoDiv').style.display = "block";
}