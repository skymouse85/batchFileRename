document.addEventListener('DOMContentLoaded', function() {
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

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const affiliates = json.map(row => ({
            value: row.code,  // Ensure 'code' matches your Excel column header
            name: row.description  // Ensure 'description' matches your Excel column header
        }));

        populateAffiliates(affiliates);
    };

    reader.readAsArrayBuffer(file);
}
function populateAffiliates(affiliates) {
    const affiliateSelect = document.getElementById('affiliateSelect');
    if (affiliateSelect.options.length <= 1) { // Check if it has only the default option
        // Clear existing options only if necessary
        affiliateSelect.innerHTML = '';

        // Add a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an Affiliate';
        affiliateSelect.appendChild(defaultOption);

        affiliates.forEach(affiliate => {
            const option = document.createElement('option');
            option.value = affiliate.value;
            option.textContent = affiliate.name;
            affiliateSelect.appendChild(option);
        });
    }
}
function renameFiles() {
    const files = document.getElementById('fileInput').files;
    const namingConvention = document.getElementById('namingConvention').value;
    const replaceUnderscores = document.getElementById('replaceUnderscores').checked;
    const downloadLinks = document.getElementById('downloadLinks');
    const keepOriginalName = document.getElementById('keepOriginalName').checked;
    const transactionRepType = document.getElementById('platformSelect').value;
    const depNum = document.getElementById('depNum').value;
    const checks = document.getElementById('checks').checked;
    const checkDepNum = document.getElementById('checkDepNum').value;
    const checkDate = document.getElementById('checkDate').value;
    const depDate = document.getElementById('depDate').value;
    const chNum = document.getElementById('chNum').value;
    const donor = document.getElementById('donor').value;
    const amount = document.getElementById('amount').value;
    const affiliateSelect = document.getElementById('affiliateSelect').value;

    downloadLinks.innerHTML = ''; // Clear previous links

    Array.from(files).forEach((file, index) => {
        const extension = file.name.split('.').pop(); // Get the file extension
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

        if (checks) {
            newFileName = `${checkDepNum} ${checkDate} ${chNum} ${donor} ${amount} ${affiliateSelect}.${extension}`;
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

    zip.generateAsync({ type: "blob" }).then(function(content) {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = "renamed_files.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
}
