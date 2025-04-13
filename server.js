const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB Connection with better error handling
let mongoConnected = false;

mongoose.connect('mongodb://localhost:27017/totalexpress')
.then(() => {
    console.log('Connected to MongoDB');
    mongoConnected = true;
})
.catch(err => {
    console.warn('Warning: Could not connect to MongoDB. Some features may be limited.');
    console.warn('Error details:', err.message);
});

// Delivery Schema
const deliverySchema = new mongoose.Schema({
    nome: String,
    localColeta: String,
    localEntrega: String,
    descricao: String,
    trackingCode: String,
    status: { type: String, default: 'Pendente' },
    createdAt: { type: Date, default: Date.now }
});

const Delivery = mongoose.model('Delivery', deliverySchema);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// New endpoint for delivery registration
app.post('/api/register-delivery', async (req, res) => {
    try {
        const { nome, localColeta, localEntrega, descricao } = req.body;
        
        // Generate tracking code
        const trackingCode = 'TE' + Date.now().toString().slice(-8);
        
        // Create new delivery
        const newDelivery = new Delivery({
            nome,
            localColeta,
            localEntrega,
            descricao,
            trackingCode
        });
        
        if (mongoConnected) {
            // Save to MongoDB if available
            await newDelivery.save();
            res.json({
                success: true,
                trackingCode,
                message: 'Entrega registrada com sucesso!'
            });
        } else {
            // Fallback when MongoDB is not available
            res.json({
                success: true,
                trackingCode,
                message: 'Entrega registrada (sem armazenamento no MongoDB)'
            });
        }
    } catch (error) {
        console.error('Error registering delivery:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registrar entrega'
        });
    }
});

// National delivery quote endpoint
app.post('/api/national-quote', async (req, res) => {
    try {
        const { cepOrigem, cepDestino, peso, dimensoes, tipoServico } = req.body;
        
        // Validate required fields
        if (!cepOrigem || !cepDestino || !peso || !dimensoes) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Prepare SOAP request for Total Express API
        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://webservice.totalexpress.com.br">
                <soapenv:Header/>
                <soapenv:Body>
                    <web:calculaFrete>
                        <web:cepOrigem>${cepOrigem}</web:cepOrigem>
                        <web:cepDestino>${cepDestino}</web:cepDestino>
                        <web:peso>${peso}</web:peso>
                        <web:comprimento>${dimensoes.comprimento}</web:comprimento>
                        <web:largura>${dimensoes.largura}</web:largura>
                        <web:altura>${dimensoes.altura}</web:altura>
                        <web:tipoServico>${tipoServico || 'expresso'}</web:tipoServico>
                    </web:calculaFrete>
                </soapenv:Body>
            </soapenv:Envelope>
        `;

        const response = await axios.post(
            'https://edi.totalexpress.com.br/webservice24.php?wsdl',
            soapRequest,
            {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': '',
                    'Raid': '64322'
                },
                auth: {
                    username: 'inboxexpress-prod',
                    password: 'qoQusU6Q'
                }
            }
        );

        // Parse XML response
        const parsedResponse = parseQuoteResponse(response.data);
        res.json(parsedResponse);

    } catch (error) {
        console.error('Error calculating national quote:', error);
        res.status(500).json({ 
            error: 'Erro ao calcular frete nacional',
            details: error.message 
        });
    }
});

// Existing endpoint for tracking queries
app.post('/api/total-express', async (req, res) => {
    try {
        const { soapBody } = req.body;
        const response = await axios.post(
            'https://edi.totalexpress.com.br/webservice24.php?wsdl',
            soapBody,
            {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': '',
                    'Raid': '64322'
                },
                auth: {
                    username: 'inboxexpress-prod',
                    password: 'qoQusU6Q'
                }
            }
        );
        
        const formattedData = formatResponseData(response.data);
        res.json(formattedData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

function parseQuoteResponse(xmlData) {
    // Extract values from XML response
    const valorMatch = xmlData.match(/<valor>([^<]+)<\/valor>/);
    const prazoMatch = xmlData.match(/<prazo>([^<]+)<\/prazo>/);
    
    return {
        valor: valorMatch ? parseFloat(valorMatch[1]) : 0,
        prazo: prazoMatch ? parseInt(prazoMatch[1]) : 0,
        moeda: 'BRL'
    };
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
