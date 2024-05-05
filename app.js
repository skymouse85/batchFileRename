function renameFiles() {
    const files = document.getElementById('fileInput').files;
    const namingConvention = document.getElementById('namingConvention').value;
    const replaceUnderscores = document.getElementById('replaceUnderscores').checked;
    const downloadLinks = document.getElementById('downloadLinks');
    const keepOriginalName = document.getElementById('keepOriginalName').checked;
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
