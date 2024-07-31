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
            affil_id: row.id,  // Make sure 'code' matches your Excel column name
            name: row.name,
            project: row.project
        }));

        // populateAffiliates(affiliates);
    };

    reader.readAsArrayBuffer(file);
}
function populateAffiliates(affiliates) {
    const affiliateIdSelect = document.getElementById('affiliateIdSelect');
    const affiliateProjectSelect = document.getElementById('affiliateProjectSelect');
    // if (affiliateIdSelect.options.length > 1 && affiliateProjectSelect.options.length > 1) {
    //     // Assuming default options are already there and data is populated
    //     return; // Exit if already populated
    // }

    // Reset the content of the select elements
    affiliateIdSelect.innerHTML = '';
    affiliateProjectSelect.innerHTML = '';

    // Add default options
    const defaultIdOption = document.createElement('option');
    defaultIdOption.value = '';
    defaultIdOption.textContent = 'Affiliate ID by Project Name';
    affiliateIdSelect.appendChild(defaultIdOption);

    const defaultProjectOption = document.createElement('option');
    defaultProjectOption.value = '';
    defaultProjectOption.textContent = 'Project Name';
    affiliateProjectSelect.appendChild(defaultProjectOption);

    // Populate the select elements
    affiliates.forEach(affiliate => {
        const idOption = document.createElement('option');
        idOption.value = affiliate.affil_id;
        // console.log(affiliate.project)
        idOption.textContent = affiliate.project;
        affiliateIdSelect.appendChild(idOption);

        const projectOption = document.createElement('option');
        projectOption.value = affiliate.project; // You can decide if you want the value to be ID or something else
        projectOption.textContent = affiliate.project; // Assuming 'project' holds the last name
        affiliateProjectSelect.appendChild(projectOption);
    });
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
    const renewal = document.getElementById('renewal').checked;
    const fee = document.getElementById('fee').checked;
    const photo = document.getElementById('photo').checked;
    const checkDepNum = document.getElementById('checkDepNum').value;
    const checkDate = document.getElementById('checkDate').value;
    const depDate = document.getElementById('depDate').value;
    const chNum = document.getElementById('chNum').value;
    const donor = document.getElementById('donor').value;
    const amount = document.getElementById('amount').value;
    const photNum = document.getElementById('photNum').value;
    // const cy = document.getElementById('cy').value;
    const affiliateIdSelect = document.getElementById('affiliateIdSelect').value;
    const affiliateProjectSelect = document.getElementById('affiliateProjectSelect').value;
    console.log("Affiliate ID:", affiliateIdSelect);
console.log("Affiliate Project:", affiliateProjectSelect);

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

        // const affiliateValue = affiliateProjectSelect.value; // or affiliateIdSelect.value based on your need

        if (checks) {
            newFileName = `${checkDepNum} ${checkDate} ${chNum} ${donor} ${amount} ${affiliateProjectSelect}.${extension}`;
        }
        if (renewal) {
            newFileName = `${affiliateIdSelect} ${affiliateProjectSelect} Annual Renewal Form CY24.${extension}`;
        }
        if (fee) {
            newFileName = `${affiliateIdSelect} ${affiliateProjectSelect} Annual Fee Form CY24.${extension}`;
        }
        if (photo) {
            newFileName = `${affiliateIdSelect} ${affiliateProjectSelect} phtoto ${photNum} CY24.${extension}`;
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
