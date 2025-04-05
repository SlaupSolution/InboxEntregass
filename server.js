const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Endpoint para registro de coleta (existente)
app.post('/enviar', async (req, res) => {
    const { nome, cpf, bairro, cidade, estado, telefone, nfeNumero, nfeSerie, nfeData, nfeChave } = req.body;

    const soapRequest = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
                       xmlns:ns1="urn:RegistraColeta">
            <soap:Body>
                <ns1:RegistraColeta>
                    <RegistraColetaRequest>
                        <Encomendas>
                            <item>
                                <TipoServico>1</TipoServico>
                                <TipoEntrega>0</TipoEntrega>
                                <Volumes>2</Volumes>
                                <CondFrete>CIF</CondFrete>
                                <Pedido>763</Pedido>
                                <IdCliente>1</IdCliente>
                                <Natureza>Scrubs</Natureza>
                                <IsencaoIcms>0</IsencaoIcms>
                                <DestNome>${nome}</DestNome>
                                <DestCpfCnpj>${cpf}</DestCpfCnpj>
                                <DestEnd>Endereço padrão</DestEnd>
                                <DestEndNum>123</DestEndNum>
                                <DestCompl></DestCompl>
                                <DestBairro>${bairro}</DestBairro>
                                <DestCidade>${cidade}</DestCidade>
                                <DestEstado>${estado}</DestEstado>
                                <DestCep>60175224</DestCep>
                                <DestEmail>cliente@email.com</DestEmail>
                                <DestDdd>85</DestDdd>
                                <DestTelefone1>${telefone}</DestTelefone1>
                                <DocFiscalNFe>
                                    <item>
                                        <NfeNumero>${nfeNumero}</NfeNumero>
                                        <NfeSerie>${nfeSerie}</NfeSerie>
                                        <NfeData>${nfeData}</NfeData>
                                        <NfeValTotal>1212.55</NfeValTotal>
                                        <NfeValProd>1217.22</NfeValProd>
                                        <NfeChave>${nfeChave}</NfeChave>
                                    </item>
                                </DocFiscalNFe>
                            </item>
                        </Encomendas>
                    </RegistraColetaRequest>
                </ns1:RegistraColeta>
            </soap:Body>
        </soap:Envelope>
    `;

    try {
        const response = await axios.post('https://edi.totalexpress.com.br/soap/webservice_v24.total', soapRequest, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'urn:RegistraColeta'
            }
        });

        res.json({
            status: 'success',
            message: 'Pedido registrado com sucesso!',
            data: response.data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao registrar pedido.',
            error: error.message
        });
    }
});

// Novo endpoint para consultas de rastreamento/histórico
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

function formatResponseData(xmlData) {
    const deliveries = [];
    const now = new Date();
    
    if (xmlData.includes('rastreamento')) {
        deliveries.push({
            nome: 'Destinatário Exemplo',
            local: 'Centro de Distribuição - SP',
            status: 'Em trânsito',
            data: now.toLocaleDateString(),
            codigo: `COD${Math.floor(1000 + Math.random() * 9000)}`,
            ultimaAtualizacao: now.toLocaleString()
        });
    } 
    else if (xmlData.includes('historico')) {
        const statuses = ['Entregue', 'Em trânsito', 'Pendente'];
        const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre'];
        
        for (let i = 1; i <= 5; i++) {
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            const randomDate = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
            
            deliveries.push({
                nome: `Cliente ${i}`,
                local: randomCity,
                status: randomStatus,
                data: randomDate.toLocaleDateString(),
                codigo: `COD${Math.floor(1000 + Math.random() * 9000)}`,
                ultimaAtualizacao: randomDate.toLocaleString()
            });
        }
    }
    
    return { deliveries, rawResponse: xmlData };
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
