function renameFiles() {
    const files = document.getElementById('fileInput').files;
    const namingConvention = document.getElementById('namingConvention').value;
    const replaceUnderscores = document.getElementById('replaceUnderscores').checked;
    const downloadLinks = document.getElementById('downloadLinks');
    const keepOriginalName = document.getElementById('keepOriginalName').checked;
    const xlsx = require('xlsx');


    // const zip = new JSZip();

    downloadLinks.innerHTML = ''; //clear previous links

    Array.from(files).forEach((file, index) => {
        let newFileName;

        if (keepOriginalName) {
            newFileName = file.name;  // Use the original file name
        } else {
            const extension = file.name.split('.').pop();
            newFileName = namingConvention.replace('{n}', index + 1) + '.' + extension;  // Apply new naming convention
        }

        // Replace underscores if the option is checked
        if (replaceUnderscores) {
            newFileName = newFileName.replace(/_/g, ' ');
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
        // link.style.display = "block";
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
            alert("Please eneter a naming convention or choose 'keep original name'.");
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

        zip.generateAsync({type: "blob"}).then(function(content) {
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = "renamed_files.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
    }






    //------------------------------------ AFFILIATE OBJECT CODE-----------------------------------------
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    function handleFileSelect(evt) {
    const files = evt.target.files;
    if (!files.length) return;
    
    const file = files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
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
    const selectElement = document.getElementById('affiliate-select');
    selectElement.innerHTML = '';  // Clear existing options
    affiliates.forEach(affiliate => {
        const option = document.createElement('option');
        option.value = affiliate.value;
        option.textContent = affiliate.name;
        selectElement.appendChild(option);
    });
}



document.addEventListener('DOMContentLoaded', function() {
    fetch('public/affiliates.json')
        .then(response => response.json())
        .then(affiliates => {
            const selectElement = document.getElementById('affiliate-select');
            affiliates.forEach(affiliate => {
                const option = document.createElement('option');
                option.value = affiliate.value;
                option.textContent = affiliate.name;
                selectElement.appendChild(option);
            });
        })
        .catch(error => console.error('Failed to load affiliates:', error));
});
