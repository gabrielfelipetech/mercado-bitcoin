const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    return true;
}

function isDateInFuture(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
}

function isUnder18(dobString) {
    const dob = new Date(dobString);
    const now = new Date();
    const minDateForAdult = new Date(
        now.getFullYear() - 18,
        now.getMonth(),
        now.getDate()
    );
    return dob > minDateForAdult;
}

function isValidCPF(cpfString) {
    const onlyDigits = cpfString.replace(/\D/g, '');
    return onlyDigits.length === 11;
}

function isValidCNPJ(cnpjString) {
    const onlyDigits = cnpjString.replace(/\D/g, '');
    return onlyDigits.length === 14;
}

app.get('/registration', (req, res) => {
    const formData = {
        steps: [
            {
                step: 1,
                labelStep: 'Seja bem vindo(a)',
                fields: [
                    {
                        name: 'email',
                        type: 'email',
                        label: 'E-mail',
                        required: true,
                        selectedTypeRegistration: 'any'
                    },
                    {
                        name: 'type',
                        type: 'radio',
                        options: [
                            { value: 'PF', label: 'Pessoa Física' },
                            { value: 'PJ', label: 'Pessoa Jurídica' }
                        ],
                        required: true,
                        selectedTypeRegistration: 'any'
                    }
                ]
            },
            {
                step: 2,
                labelStep: '',
                fields: [
                    {
                        name: 'name',
                        type: 'text',
                        label: 'Nome',
                        required: true,
                        selectedTypeRegistration: 'cpf'
                    },
                    {
                        name: 'cpf',
                        type: 'text',
                        label: 'CPF',
                        required: true,
                        selectedTypeRegistration: 'cpf'
                    },
                    {
                        name: 'dob',
                        type: 'date',
                        label: 'Data de Nascimento',
                        required: true,
                        selectedTypeRegistration: 'cpf'
                    },
                    {
                        name: 'phone',
                        type: 'tel',
                        label: 'Telefone',
                        required: true,
                        selectedTypeRegistration: 'any'
                    },
                    {
                        name: 'companyName',
                        type: 'text',
                        label: 'Razão Social',
                        required: true,
                        selectedTypeRegistration: 'cnpj'
                    },
                    {
                        name: 'cnpj',
                        type: 'text',
                        label: 'CNPJ',
                        required: true,
                        selectedTypeRegistration: 'cnpj'
                    },
                    {
                        name: 'foundDate',
                        type: 'date',
                        label: 'Data de Abertura',
                        required: true,
                        selectedTypeRegistration: 'cnpj'
                    }
                ]
            },
            {
                step: 3,
                labelStep: 'Senha de acesso',
                fields: [
                    {
                        name: 'password',
                        type: 'password',
                        label: 'Senha',
                        required: true,
                        selectedTypeRegistration: 'any'
                    }
                ]
            },
            {
                step: 4,
                labelStep: 'Revise suas informações',
                fields: [
                    { name: 'email', type: 'email', label: 'E-mail', required: true, selectedTypeRegistration: 'any' },
                    { name: 'name', type: 'text', label: 'Nome', required: true, selectedTypeRegistration: 'cpf' },
                    { name: 'cpf', type: 'text', label: 'CPF', required: true, selectedTypeRegistration: 'cpf' },
                    { name: 'cnpj', type: 'text', label: 'CNPJ', required: true, selectedTypeRegistration: 'cnpj' },
                    { name: 'dob', type: 'date', label: 'Data de Nascimento', required: true, selectedTypeRegistration: 'cpf' },
                    { name: 'foundDate', type: 'date', label: 'Data de Abertura', required: true, selectedTypeRegistration: 'cnpj' },
                    { name: 'phone', type: 'tel', label: 'Telefone', required: true, selectedTypeRegistration: 'any' },
                    { name: 'password', type: 'password', label: 'Senha', required: true, selectedTypeRegistration: 'any' }
                ]
            }
        ]
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(formData);
});

app.post('/registration', (req, res) => {
    const {
        email,
        type,
        name,
        cpf,
        dob,
        phone,
        companyName,
        cnpj,
        foundDate,
        password
    } = req.body;

    if (!email || !type || !password) {
        return res
            .status(400)
            .json({ error: 'Campos obrigatórios faltando (email, type ou password).' });
    }

    if (!isValidEmail(email)) {
        return res
            .status(400)
            .json({ error: 'E-mail inválido, verifique o formato.' });
    }

    if (type === 'PF') {
        if (!name || !cpf || !dob || !phone) {
            return res
                .status(400)
                .json({ error: 'Campos obrigatórios de PF faltando.' });
        }
        if (!isValidCPF(cpf)) {
            return res
                .status(400)
                .json({ error: 'CPF inválido. Forneça 11 dígitos numéricos.' });
        }
        if (!isValidDate(dob)) {
            return res
                .status(400)
                .json({ error: 'Data de nascimento inválida.' });
        }
        if (isDateInFuture(dob)) {
            return res
                .status(400)
                .json({ error: 'Data de nascimento não pode ser no futuro.' });
        }
        if (isUnder18(dob)) {
            return res
                .status(400)
                .json({ error: 'Usuário deve ter pelo menos 18 anos.' });
        }
    }

    if (type === 'PJ') {
        if (!companyName || !cnpj || !foundDate || !phone) {
            return res
                .status(400)
                .json({ error: 'Campos obrigatórios de PJ faltando.' });
        }
        if (!isValidCNPJ(cnpj)) {
            return res
                .status(400)
                .json({ error: 'CNPJ inválido. Forneça 14 dígitos numéricos.' });
        }
        if (!isValidDate(foundDate)) {
            return res
                .status(400)
                .json({ error: 'Data de abertura inválida.' });
        }
        if (isDateInFuture(foundDate)) {
            return res
                .status(400)
                .json({ error: 'Data de abertura não pode ser no futuro.' });
        }
    }
    return res.status(200).json({ message: 'Cadastro realizado com sucesso!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
