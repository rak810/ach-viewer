const achFileInput = document.querySelector('#achFile');
const viewBtn = document.querySelector('#viewBtn');
let lastOpenedFileDetail;
viewBtn.addEventListener('click', function (e) {
    const fileReader = new FileReader();
    const achFile = achFileInput.files[0];
    fileReader.onload = readAchFile;
    fileReader.onerror = err => console.log(err);
    fileReader.readAsText(achFile);
    console.log(achFile)
});

function readAchFile(evt) {
    const achFileContent = evt.target.result.trim();
    const fileInfos = document.querySelector('#fileInfos');
    const batchInfos = document.querySelector('#batchInfos');
    fileInfos.classList.remove('hidden');

    if (isValidACH(achFileContent)) {
        batchInfos.classList.remove('hidden');
        batchInfos.innerHTML = `<h2 class="text-xl font-semibold mb-4">Batches <span id="batchCount"></span></h2>`;
        const lines = achFileContent.split('\n');
        const achObj = processAch(lines);
        const fileHeaderRecord = achObj.fileHeaderRecord;
        const fileControlRecord = achObj.fileControlRecord;
        const batches = achObj.batches;
        displayFileRecord(fileHeaderRecord, fileControlRecord);
        console.log(batches);
        renderBatches(batches);
    }
    else {
        fileInfos.innerHTML = '<div>This file is invalid</div>'
    }

}
function renderBatches(batches) {
    const templateCollapsible = document.querySelector('#collapsibleTemplate').cloneNode(true);
    const fileDetails = document.querySelector('#fileDetails').cloneNode(true);
    fileDetails.te
    const batchInfos = document.querySelector('#batchInfos');
    templateCollapsible.removeAttribute('id');
    templateCollapsible.classList.remove('hidden');
    templateCollapsible.classList.add('mb-2');
    
    fileDetails.removeAttribute('id');
    document.querySelector('#batchCount').textContent = `(${batches.length})`
    for (let i = 0; i < batches.length; i++) {
        templateCollapsible.id = `batch-${i}`;
        // const attr = document.createAttribute('target-data');
        // attr.value = `fileDetails-${i}`;
        templateCollapsible.setAttribute('target-data', `fileDetails-${i}`);
        templateCollapsible.innerHTML = `<div target-data="fileDetails-${i}">Batch ${i}</div>`;
        fileDetails.id = `fileDetails-${i}`;
        fileDetails.querySelector('#batchNo').textContent = batches[i].batchControlRecord.batchNumber;
        fileDetails.querySelector('#entryType').textContent = getServiceClass(batches[i].batchHeaderRecord.servieClassCode);
        fileDetails.querySelector('#entryClass').textContent = batches[i].batchHeaderRecord.standardEntryClass;
        fileDetails.querySelector('#companyName').textContent = batches[i].batchHeaderRecord.companyName;
        fileDetails.querySelector('#finInstitute').textContent = `${batches[i].batchControlRecord.originatingFinancialInstitution}`;
        fileDetails.querySelector('#description').textContent = batches[i].batchHeaderRecord.companyEntryDescription;
        fileDetails.querySelector('#companyDate').textContent = batches[i].batchHeaderRecord.compnanyDescriptiveDate;
        fileDetails.querySelector('#batchDebit').textContent = `$${batches[i].batchControlRecord.totalDebitEntryAmount}`;
        fileDetails.querySelector('#batchCredit').textContent = `$${batches[i].batchControlRecord.totalCreditEntryAmount}`;
        const tbody = fileDetails.querySelector('#tableBody');
        tbody.innerHTML = '';
        batches[i].entries.forEach((entry) => {
            tbody.innerHTML += `<tr class="even:bg-gray-100 odd:bg-white"><td class="border p-2">${getTransactionCodeDescription(entry.transactionCode)}</td>
            <td class="border p-2">${entry.traceNumber}</td>
            <td class="border p-2">${entry.receivingCompanyName}</td>
            <td class="border p-2">${entry.receivingCompanyName}</td>
            <td class="border p-2">${entry.receivingDFIIdentification}</td>
            <td class="border p-2">$${entry.amount}</td>
            </tr>`;
        });
        fileDetails.querySelector('#addendaCount').textContent = `(${batches[i].addenda.length})`;
        const addendaList = fileDetails.querySelector('#addendaList');
        if(batches[i].addenda.length > 0) {
            batches[i].addenda.forEach((adInfo) => {
                addendaList.innerHTML += `<li>${adInfo.paymentRelatedInformation}</li>`
            })
        }
        else {
            fileDetails.querySelector('#addendaDiv').innerHTML = '<p class="font-semibold">No addenda available</p>'
        }
        // fileDetails.querySelector('#transactionType').textContent = batches[i].entry.transactionCode;
        // fileDetails.querySelector('#trace').textContent = batches[i].entry.traceNumber;
        // fileDetails.querySelector('#receiver').textContent = batches[i].entry.receivingCompanyName;
        // fileDetails.querySelector('#receiveAccountNumber').textContent = batches[i].entry.receivingCompanyName;
        // fileDetails.querySelector('#receiverRN').textContent = batches[i].entry.receivingDFIIdentification;
        // fileDetails.querySelector('#entryAmount').textContent = `$${processAmount(batches[i].entry.amount)}`;

        batchInfos.appendChild(templateCollapsible.cloneNode(true));
        batchInfos.appendChild(fileDetails.cloneNode(true));
        console.log(i);
    }

    for(let i = 0; i < batches.length; i++) {
        const divId = document.querySelector(`#batch-${i}`);
        divId.addEventListener('click', batchToggle);
    }
}

function batchToggle(e) {
    // console.log('clicked', e.target);
    const fileDetailId = e.target.getAttribute('target-data');
    const fileDetail = document.querySelector(`#${fileDetailId}`);
    fileDetail.classList.toggle('hidden');
    if(!fileDetail.classList.contains('hidden')) {
        const fileDetails = document.querySelectorAll('[id^="fileDetails"]');
        for(let i = 0; i < fileDetails.length; i++) {
            if(fileDetails[i].id !== fileDetailId && !fileDetails[i].classList.contains('hidden')) {
                fileDetails[i].classList.add('hidden');
            }
        }
    }
    // if(e.target.classList.contains('clicked')) {
    //     fileDetail.classList.add('hidden');
    //     e.target.classList.remove('clicked');
    //     lastOpenedFileDetail = null;
    // }
    // else {
    //     const fileDetails = document.querySelectorAll('[id^="fileDetails"]');
    //     for(let i = 0; i < fileDetails.length; i++) {
    //         if(fileDetails[i].id !== fileDetailId && !fileDetails[i].classList.contains('hidden')) {
    //             fileDetails[i].classList.add('hidden');
    //         }
    //     }
    //     fileDetail.classList.remove('hidden');
    //     // lastOpenedFileDetail = fileDetail;
    //     e.target.classList.add('clicked');
    // }
    // e.preventDefault();
}
function displayFileRecord(fileHeaderRecord, fileControlRecord) {
    const fileCreationDate = document.querySelector('#fileCreationDate');
    const immOrigin = document.querySelector('#immOrigin');
    const immDest = document.querySelector('#immDest');
    const entryHash = document.querySelector('#entryHash');
    const batchCount = document.querySelector('#batchCountTotal');
    const blockCount = document.querySelector('#blockCount');
    const entryCount = document.querySelector('#entryCount');
    const fileDebit = document.querySelector('#fileDebit');
    const fileCredit = document.querySelector('#fileCredit');
    fileCreationDate.textContent = `${fileHeaderRecord.fileCreationDate} ${fileHeaderRecord.fileCreationTime}`;
    immOrigin.textContent = `${fileHeaderRecord.immediateOriginName}`;
    immDest.textContent = `${fileHeaderRecord.immediateDestinationName}`;
    entryHash.textContent = fileControlRecord.entryHash;
    batchCount.textContent = `${parseInt(fileControlRecord.batchCount)}`;
    blockCount.textContent = `${parseInt(fileControlRecord.blockCount)}`;
    entryCount.textContent = `${parseInt(fileControlRecord.entryOrAddendaCount)}`;
    fileDebit.textContent = `$${fileControlRecord.totalDebitEntryAmount}`;
    fileCredit.textContent = `$${fileControlRecord.totalCreditEntryAmount}`;
}

function getTransactionCodeDescription(transactionCode) {
    const descriptions = {
        '22': 'Deposit destined for a Checking Account',
        '23': 'Prenotification for a checking credit',
        '24': 'Zero dollar with remittance into a Checking Account',
        '27' : 'Debit destined for a Checking Account',
        '28' : 'Prenotification for a checking debit',
        '29' : 'Zero dollar with remittance into a Checking Account',
        '32' : 'Deposit destined for a Savings Account',
        '33' : 'Prenotification for a savings credit',
        '34' : 'Zero dollar with remittance into a Savings Account',
        '37' : 'Debit destined for a Savings Account',
        '38' : 'Prenotification for a Savings debit',
        '39 ': 'Zero dollar with remittance into a Savings Account'
    }

    return `${transactionCode} - ${descriptions[transactionCode]}`;
}

function getServiceClass(serviceCode) {
    let serviceClass;
    switch (serviceCode) {
        case '200':
             serviceClass = '200 - Mixed Debit and Credit';
             break;
        case '220':
             serviceClass = '220 - Credits';
             break;
        case '225':
             serviceClass = '225 - Debits';
             break;
        default:
             serviceClass = `${serviceCode} - Unknown`;
            break;
    }

    return serviceClass;
}

function isValidACH(achContent) {
    return true;
}
function processAch(lines) {
    let res = {
        'fileHeaderRecord': '',
        'batches': [],
        'fileControlRecord': ''
    };



    lines.forEach(line => {
        switch (line[0]) {
            case '1':
                res['fileHeaderRecord'] = processFileHeaderRecord(line);
                break;
            case '5':
                let batch = {
                    'batchHeaderRecord': '',
                    'entries': [],
                    'addenda': [],
                    'batchControlRecord': ''
                };
                batch['batchHeaderRecord'] = processBatchHeaderRecord(line);
                res['batches'].push(batch);
                break;
            case '6':
                res['batches'][res['batches'].length - 1]['entries'].push(processCCDEntryDetail(line));
                break;
            case '7':
                res['batches'][res['batches'].length - 1]['addenda'].push(processCCDAddendaRecord(line));
                break;
            case '8':
                res['batches'][res['batches'].length - 1]['batchControlRecord'] = processBatchControlRecord(line);
                break;
            case '9':
                if (isFileControlRecord(line)) {
                    res['fileControlRecord'] = processFileControlRecord(line);
                }
                break;
            default:
                throw new Error('Invalid Ach File!');
        }
    });
    return res;
}

function isFileControlRecord(recordLine) {
    let cnt = 0;
    for (let i = 0; i < recordLine.length; i++) {
        if (recordLine[i] === '9') cnt++;
    }
    return cnt !== recordLine.length;
}
function processFileHeaderRecord(fileHeader) {
    return {
        recordType: fileHeader.slice(0, 1),
        priorityCode: fileHeader.slice(1, 3),
        immediateOrigin: fileHeader.slice(3, 13).trim(),
        immediateDestination: fileHeader.slice(13, 23),
        fileCreationDate: fileHeader.slice(23, 29),
        fileCreationTime: fileHeader.slice(29, 33),
        fileIDModifier: fileHeader.slice(33, 34),
        recordSize: fileHeader.slice(34, 37),
        blockingFactor: fileHeader.slice(37, 39),
        formatCode: fileHeader.slice(39, 40),
        immediateDestinationName: fileHeader.slice(40, 63).trim(),
        immediateOriginName: fileHeader.slice(63, 86).trim(),
        referenceCode: fileHeader.slice(86, 94).trim()
    };
}

function processBatchHeaderRecord(batchHeader) {
    return {
        recordType: batchHeader.slice(0, 1),
        servieClassCode: batchHeader.slice(1, 4),
        companyName: batchHeader.slice(4, 20).trim(),
        discretionaryData: batchHeader.slice(20, 40).trim(),
        companyIdentification: batchHeader.slice(40, 50),
        standardEntryClass: batchHeader.slice(50, 53),
        companyEntryDescription: batchHeader.slice(53, 63).trim(),
        compnanyDescriptiveDate: batchHeader.slice(63, 69),
        effectiveEntryDate: batchHeader.slice(69, 75),
        reserved: batchHeader.slice(75, 78).trim(),
        originatorStatusCode: batchHeader.slice(78, 79),
        originatingFinancialInstitution: batchHeader.slice(79, 87),
        batchNumber: parseInt(batchHeader.slice(87, 94))

    }
}

function processCCDEntryDetail(entryDetail) {
    return {
        recordType: entryDetail.slice(0, 1),
        transactionCode: entryDetail.slice(1, 3),
        receivingDFIIdentification: entryDetail.slice(3, 11),
        checkDigit: entryDetail.slice(11, 12),
        dfiAccountNumber: entryDetail.slice(12, 29).trim(),
        amount: processAmount(entryDetail.slice(29, 39)),
        indentificationNumber: entryDetail.slice(39, 54).trim(),
        receivingCompanyName: entryDetail.slice(54, 76).trim(),
        discretionaryData: entryDetail.slice(76, 78).trim(),
        addendaRecordIndicator: entryDetail.slice(78, 79),
        traceNumber: entryDetail.slice(79, 94)
    }
}

function processCCDAddendaRecord(addenda) {
    return {
        recordType: addenda.slice(0, 1),
        addendaTypeCode: addenda.slice(1, 3),
        paymentRelatedInformation: addenda.slice(3, 83).trim(),
        addendaSequenceNumber: addenda.slice(83, 87),
        entryDetailSequenceNumber: addenda.slice(87, 94)
    }
}

function processBatchControlRecord(batchControl) {
    return {
        recordType: batchControl.slice(0, 1),
        servieClassCode: batchControl.slice(1, 4),
        entryOrAddendaCount: batchControl.slice(4, 10),
        entryHash: batchControl.slice(10, 20),
        totalDebitEntryAmount: processAmount(batchControl.slice(20, 32)),
        totalCreditEntryAmount: processAmount(batchControl.slice(32, 44)),
        companyIdentification: batchControl.slice(44, 54),
        messageAuthCode: batchControl.slice(54, 73).trim(),
        reserved: batchControl.slice(73, 79).trim(),
        originatingFinancialInstitution: batchControl.slice(79, 87),
        batchNumber: parseInt(batchControl.slice(87, 94))
    }
}

function processFileControlRecord(fileControl) {
    return {
        recordType: fileControl.slice(0, 1),
        batchCount: fileControl.slice(1, 7),
        blockCount: fileControl.slice(7, 13),
        entryOrAddendaCount: fileControl.slice(13, 21),
        entryHash: fileControl.slice(21, 31),
        totalDebitEntryAmount: processAmount(fileControl.slice(31, 43)),
        totalCreditEntryAmount: processAmount(fileControl.slice(43, 55)),
        reserved: fileControl.slice(55, 94).trim()
    }
}

function processAmount(amount) {
    // console.log('amount', amount);
    const beforeDecimalAmount = amount.slice(0, amount.length-2);
    const afterDecimalAmount = amount.slice(amount.length-2);
    // console.log(`${beforeDecimalAmount}.${afterDecimalAmount}`);
    return parseFloat(`${beforeDecimalAmount}.${afterDecimalAmount}`);
}