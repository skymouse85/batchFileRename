document.addEventListener('DOMContentLoaded', function () {
    // Load affiliates from a static JSON file when the page loads
    fetch('/affiliates.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(affiliates => {
            console.log("Affiliates loaded:", affiliates);  // Log the affiliates to console for debugging
            populateAffiliates(affiliates);
        })
        .catch(error => console.error('Failed to load affiliates:', error));
});
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(evt) {
    const files = evt.target.files;
    if (!files.length) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const affiliates = json.map(row => ({
            affil_id: row.id,
            name: row.name,
            project: row.project
        }));


    };

    reader.readAsArrayBuffer(file);
}

function populateAffiliates(affiliates) {
    const affiliateSelect = document.getElementById('affiliateSelect');
    affiliateSelect.innerHTML = '';  // Clear any existing options

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select an Affiliate';
    affiliateSelect.appendChild(defaultOption);

    affiliates.forEach(affiliate => {
        const option = document.createElement('option');
        // Combine ID and Project Name in the value or textContent as needed
        option.value = affiliate.affil_id + '|' + affiliate.project;  // Example: '123|ProjectName'
        option.textContent = `${affiliate.project} (ID: ${affiliate.affil_id})`;  // Display format
        affiliateSelect.appendChild(option);
    });
}

function getCustomDateString() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}${month}XX`
}

function formatCurrency(value) {
    const number = Number(value.replace(/[^0-9.-]+/g, ""));
    if (isNaN(number)) {
        console.error("Invalid number for formatting");
        return "";
    }
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    return formatter.format(number)
}


function renameFiles() {
    const files = document.getElementById('fileInput').files;
    const affiliateValue = document.getElementById('affiliateSelect').value;
    const [affil_id, project] = affiliateValue.split('|');
    const namingConvention = document.getElementById('namingConvention').value;
    const replaceUnderscores = document.getElementById('replaceUnderscores').checked;
    const downloadLinks = document.getElementById('downloadLinks');
    const keepOriginalName = document.getElementById('keepOriginalName').checked;
    const transactionRepType = document.getElementById('platformSelect').value;
    const depNum = document.getElementById('depNum').value;
    const checks = document.getElementById('checks').checked;
    const renewal = document.getElementById('renewal').checked;
    const fee = document.getElementById('fee').checked;
    const apInvoices = document.getElementById('apInvoices').checked;
    const photo = document.getElementById('photo').checked;
    const agreement = document.getElementById('agreement').checked;
    const checkDepNum = document.getElementById('checkDepNum').value;
    const checkDate = document.getElementById('checkDate').value;
    const depDate = document.getElementById('depDate').value;
    const chNum = document.getElementById('chNum').value;
    const donor = document.getElementById('donor').value;
    const amount = document.getElementById('amount').value;
    const photNum = document.getElementById('photNum').value;
    const recDate = document.getElementById('recDate').value;
    const recVendor = document.getElementById('recVendor').value;
    const recAmount = document.getElementById('recAmount').value;
    const recDetails = document.getElementById('recDetails').value;
    const apDetails = document.getElementById('apDetails').value;
    const grants = document.getElementById('grants').checked;
    const grantDepNum = document.getElementById('grantDepNum').value;
    const grantDate = document.getElementById('grantDate').value;
    const grantNum = document.getElementById('grantNum').value;
    const grantDonor = document.getElementById('grantDonor').value;
    const grntAmount = document.getElementById('grntAmount').value;



    // const cy = document.getElementById('cy').value;
    // const affiliateIdSelect = document.getElementById('affiliateIdSelect').value;
    // const affiliateProjectSelect = document.getElementById('affiliateProjectSelect').value;
    console.log("Affiliate ID:", affil_id);
    console.log("Affiliate Project:", project);
    //check for files
    if (files.length === 0) {
        window.alert("😔 You have not selected any files to rename 😔")
        return;
    }

    downloadLinks.innerHTML = ''; // Clear previous links

    Array.from(files).forEach((file, index) => {
        const extension = file.name.split('.').pop(); // Get the file extension
        const formattedAmount = formatCurrency(amount);
        const formattedRecAmount = formatCurrency(recAmount);
        const formattedGrntAmount = formatCurrency(grntAmount);
        const formattedAPDate = getCustomDateString();
        let newFileName;

        if (keepOriginalName) {
            newFileName = file.name;  // Use the original file name
        } else {
            newFileName = namingConvention.replace('{n}', index + 1) + '.' + extension;  // Apply new naming convention
        }

        // Replace underscores if the option is checked
        if (replaceUnderscores) {
            newFileName = newFileName.replace(/_/g, ' ');
        }

        // strictly deal with transaction reports
        if (transactionRepType) {
            newFileName = `${depDate} ${transactionRepType} Transaction Reports DEP_NUM ${depNum}.${extension}`;
        }
        // Recepits Rename
        if (recDate) {
            newFileName = `${recDate} ${recVendor} ${formattedRecAmount} ${recDetails}.${extension}`;
        }

        // const affiliateValue = affiliateProjectSelect.value; // or affiliateIdSelect.value based on your need

        if (apInvoices) {
            newFileName = `${formattedAPDate} ${project} ${amount} [CHK#${chNum} ${checkDate}] ${apDetails}.${extension}`
        }

        if (checks) {
            newFileName = `${checkDepNum} ${checkDate} ${chNum} - ${donor} - ${formattedAmount} - ${project}.${extension}`;
        }

        if (grants) {
            newFileName = `${grantDepNum} ${grantDate} ${grantNum} - ${grantDonor} - ${formattedGrntAmount} - ${project}.${extension}`;
        }

        if (agreement) {
            newFileName = `${affil_id} ${project} - FSP Agreement CY24.${extension}`;
        }
        if (renewal) {
            newFileName = `${affil_id} ${project} - Annual Renewal Form CY24.${extension}`;
        }
        if (fee) {
            newFileName = `${affil_id} ${project} - Annual Fee Form CY24.${extension}`;
        }
        if (photo) {
            newFileName = `${affil_id} ${project} - photo ${photNum} CY24.${extension}`;
        }

        // Create Blob URL for the new file
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);

        // Create and append the download link
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = url;
        link.download = newFileName;
        link.textContent = `Download ${newFileName}`;
        listItem.appendChild(link);
        downloadLinks.appendChild(listItem);
    });
}

//Run renameFiles on Enter keydown
window.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        renameFiles();
    }
})


function renameSFMDFiles() {
    const files = document.getElementById('fileInput').files;
    const downloadLinks = document.getElementById('downloadLinks');
    downloadLinks.innerHTML = ''; // Clear previous links

    Array.from(files).forEach((file) => {
        const originalName = file.name;
        let newFileName = renameSFMDFile(originalName);  // Use the specialized renaming function

        // Create Blob URL for the new file
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);

        // Create and append the download link
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = url;
        link.download = newFileName;
        link.textContent = `Download ${newFileName}`;
        listItem.appendChild(link);
        downloadLinks.appendChild(listItem);
    });
}

function renameSFMDFile(originalName) {
    // Logic to process filenames starting with "SFMD"
    const pattern = /^SFMD_24_\d{2}/;
    if (pattern.test(originalName)) {
        const index = originalName.indexOf('_', 10);
        const preservedPart = originalName.substring(0, index);
        const rest = originalName.substring(index).replace(/_/g, ' ');
        return preservedPart + rest;
    }
    return originalName;  // Return the original name if no match
}



function renameAndDownloadFiles() {
    const files = document.getElementById('fileInput').files;
    const namingConvention = document.getElementById('namingConvention').value;
    const replaceUnderscores = document.getElementById('replaceUnderscores').checked;
    const keepOriginalName = document.getElementById('keepOriginalName').checked;
    const zip = new JSZip();

    if (!namingConvention) {
        alert("Please enter a naming convention or choose 'keep original name'.");
        return;
    }

    Array.from(files).forEach((file, index) => {
        let newFileName;

        if (keepOriginalName) {
            newFileName = file.name;
        } else {
            const extension = file.name.split('.').pop();
            newFileName = namingConvention.replace('{n}', index + 1) + '.' + extension;
        }

        if (replaceUnderscores) {
            newFileName = newFileName.replace(/_/g, ' ');
        }

        zip.file(newFileName, file);
    })

    zip.generateAsync({ type: "blob" }).then(function (content) {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = "renamed_files.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
}
