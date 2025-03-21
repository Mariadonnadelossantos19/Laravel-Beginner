import "./bootstrap";
$(document).ready(function(){

    $(document).on("click", ".cancel-update-reply", function () {
        let closestDiv = $(this).closest("div.card");
        closestDiv.find(".card-footer .update-actions").hide();
        closestDiv.find(".card-footer .default-actions").show();
        closestDiv.addClass("bg-light").removeClass("bg-white border border-dark");

        let closestContentArea = closestDiv.find("textarea");
        let content = '<p class="card-text reply-content">' + strOldContent +'</p>';
        let footerStart = closestDiv.find(".card-footer div.text-start");
        footerStart.empty();
        closestContentArea.replaceWith(content);
        intUpdateReplyID = '';
        strOldContent = '';
        boolRemoveClipUpdate = false;
        closestDiv.find(".card-footer div.text-start").append(htmlDownloadClip);
    });

    $(document).on("click", ".update-reply", function () {
        let closestDiv = $(this).closest("div.card");
        let closestContentArea = closestDiv.find("textarea");
        let closestTextareaValue = closestContentArea.val();
        let closestUploadFile = closestDiv.find("input");
        let footerStart = closestDiv.find(".card-footer div.text-start");
        let replyForm = new FormData();

        if (closestUploadFile.val()) {
            replyForm.append("file", closestUploadFile[0].files[0]);
        }

        replyForm.append("id", intUpdateReplyID);
        replyForm.append("content", closestTextareaValue);
        replyForm.append("removeClip", boolRemoveClipUpdate);

        // Fetch options
        const options = {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: replyForm,
        };
        // Perform the fetch request
        fetch('/api/update-comment-reply', options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // or response.text() depending on your response format
        })
        .then(data => {
            // Handle success
            var response = data;

            if (data.success) {
                closestDiv.find(".card-footer .update-actions").hide();
                closestDiv.find(".card-footer .default-actions").show();
                closestDiv.addClass("bg-light").removeClass("bg-white border border-dark");
                
                let content = '<p class="card-text reply-content">' + closestTextareaValue +'</p>';
                closestContentArea.replaceWith(content);
                footerStart.empty();

                if (closestUploadFile.val()) {
                    let fileName = closestUploadFile[0].files[0].name;
                    let fileExtension = fileName.split('.').pop().toLowerCase();
                    let downloadLink = response.file;
                    let icon = (fileExtension == 'pdf') ? '<i class="fas fa-file-pdf text-danger me-1" style="font-size:14px"></i>' : '<i class="far fa-file-image text-danger me-1" style="font-size:14px"></i>';
                    let downloadButton = `<a href="${app_url}/storage/comments/${downloadLink}" 
                    class="btn btn-sm btn-light mb-0 rounded-pill font-weight-normal px-3 border border-secondary text-truncate text-xs shadow-none" 
                    style="max-width:150px" 
                    target="_blank" title="${fileName}">${icon} ${fileName}</a>`;
                    footerStart.append(downloadButton);
                }

                if(boolRemoveClipUpdate == true){
                    htmlDownloadClip = '';
                }
                
                if(htmlDownloadClip){
                    closestDiv.find(".card-footer div.text-start").append(htmlDownloadClip);
                }

                intUpdateReplyID = '';
                processColumnCells();
                boolRemoveClipUpdate = false;
            } else {
                console.error('Failed:', data.error);
            }
        })
        .catch(error => {
            // Handle errors
            console.error('Error:', error);
        })
        .finally(() => {
            // Redirect or perform action after the request completes
        });
    });

    $(document).on("click", ".edit-reply", function () {
        let replyID = $(this).data("edit-id");
        let closestDiv = $(this).closest("div.card");
        let closestContent = closestDiv.find("p.reply-content").text().trim();
        let closestContentArea = closestDiv.find("p.reply-content");
        let height = closestContentArea.height();
        let editTextarea = '<textarea type="text" class="reply-content border-0" style="resize:none;"></textarea>';

        closestDiv.removeClass("bg-light").addClass("bg-white border border-dark");
        closestContentArea.replaceWith(editTextarea);
        closestDiv.find(".reply-content").val(closestContent).focus();

        let closestTextarea = closestDiv.find(".reply-content");
        closestTextarea.height(height + "px");
        closestDiv.find(".card-footer div.text-end a").hide();

        //store existing uploaded clip to be returned if cancel button is clicked
        let elements =  closestDiv.find(".card-footer div.text-start a");
        elements.each(function(index, element) {
            var outerHTML = element.outerHTML; // Get entire HTML structure (including tag)
            htmlDownloadClip = outerHTML;
        });

        strOldContent = closestContent;

        let footerEnd = closestDiv.find(".card-footer div.text-end");
        let footerStart = closestDiv.find(".card-footer div.text-start");
        let clipButton = `<a class='btn btn-sm btn-link p-1 mb-0 update-reply-clip update-actions'>
                                <i class='fas fa-paperclip text-dark' style='font-size:20px;'></i>
                            </a>`;
        let cancelButton = "<button class='btn btn-sm btn-light cancel-update-reply mb-1 update-actions'>Cancel</button>";
        let updateButton = "<button class='btn btn-sm btn-info update-reply mb-1 update-actions'>Update</button>";
        let uploadFile = ` <input type="file" class="d-none update-upload-clip" accept="application/pdf,image/jpeg,image/jpg">
        <div class="d-flex gap-1 border border-secondary d-none update-uploaded-container" style="max-width:200px">
        <p class="p-1 mb-0 text-dark px-2 text-truncate update-uploaded-clip"></p>
        <button type="button" class="btn-close text-danger font-weight-bold update-remove-clip" aria-label="Close">x</button>
        </div>`;

        footerStart.append(uploadFile);
        footerEnd.append(clipButton);
        footerEnd.append(cancelButton);
        footerEnd.append(updateButton);
        intUpdateReplyID = replyID;

        let existingUpload = footerStart.find("a");
        let existingUploadFile = existingUpload.text();

        if(existingUploadFile){
            let closestUploadedClip = closestDiv.find("p.update-uploaded-clip");
            let closestUploadedContainer = closestDiv.find("div.update-uploaded-container");
            closestUploadedClip.text(existingUploadFile);
            closestUploadedClip.attr("title", existingUploadFile);
            closestUploadedContainer.removeClass("d-none");
            existingUpload.hide();
        }else{
            htmlDownloadClip = '';
        }
    });
    
    $(document).on("click", ".update-reply-clip", function () {
        let closestUploadFile = $(this).closest("div.card").find("input");
        closestUploadFile.trigger("click");
    });

    $(document).on("change", ".update-upload-clip", function () {
        let closestDiv = $(this).closest("div.card");
        let closestUploadFile = closestDiv.find("input");
        let closestUploadedClip = closestDiv.find("p.update-uploaded-clip");
        let closestUploadedContainer = closestDiv.find("div.update-uploaded-container");

        let allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']; // Allowed file extensions
        let files = this.files[0];
        let fileName = files.name;
        let fileExtension = fileName.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {

            Swal.fire({
                icon: "error",
                title: "Invalid file type",
                text: "Please upload jpg, jpeg, png or pdf file only.",
                confirmButtonColor: "#8392ab",
            });

            // closestUploadedClip.attr('title', 'Invalid file type. Please upload jpg, jpg or pdf file only.');
            // closestUploadedClip.html('<i class="fas fa-exclamation-triangle text-warning pe-1"></i>Invalid file type. Please upload jpg, jpg or pdf file only.');
            // closestUploadedContainer.removeClass("d-none");
            closestUploadFile.val('');
        } else {
            let files = closestUploadFile[0].files; // Get selected file
            for (let i = 0; i < files.length; i++) {
                closestUploadedClip.attr("title", files[i].name);
                closestUploadedClip.text(files[i].name);
                closestUploadedContainer.removeClass("d-none");
            }
        }

    });

    $(document).on("click", ".update-remove-clip", function () {
        let closestDiv = $(this).closest("div.card");
        let closestUploadFile = closestDiv.find("input");
        let closestUploadedClip = closestDiv.find("p.update-uploaded-clip");
        let closestUploadedContainer = closestDiv.find("div.update-uploaded-container");

        closestUploadFile.val("");
        closestUploadedClip.text("");
        closestUploadedContainer.addClass("d-none");

        boolRemoveClipUpdate = true;
    });

    
  


    $(document).on("click", ".delete-reply", function () {
        let closestDiv = $(this).closest("div.card");
        let replyID = $(this).data("delete-id");
        let closestCountAttachments = $(this).closest("div.reply-list").prev(".card").find("span.count-attachments");
        let closestCountReplies = $(this).closest("div.reply-list").prev(".card").find("span.count-replies");
        let hasAttachment = $(this).closest("div").find("span.reply-attachment").text();

    
        Swal.fire({
            title: "Are you sure you want to delete this reply?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ea0606",
            cancelButtonColor: "#8392ab",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        }).then((result) => {
            if (result.isConfirmed == true) {
                let countAttachments = parseFloat(
                    closestCountAttachments.text()
                );
                let countReplies = parseFloat(closestCountReplies.text());

                if (countAttachments > 0) {
                    if (hasAttachment > 0)
                        closestCountAttachments.html(countAttachments - 1);
                }

                if (countReplies > 0) {
                    closestCountReplies.html(countReplies - 1);
                }

                const options = {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                };
            
                fetch("/api/delete-reply/" + replyID, options)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json(); // If the server returns JSON, you can parse it here
                })
                .then((data) => {
                    if(data.success){
                        closestDiv.remove();
                        // Handle successful response data, if needed
                        console.log("Record deleted successfully,");
                        processColumnCells();
                    }else{
                        console.error("Failed:", data.error);
                    }
                })
                .catch((error) => {
                    // Handle errors here
                    console.error("Error:", error);
                });
            }
        });
    });

    $(document).on("click", ".remove-clip", function () {
        let closestUploadFile = $(this).closest("form").find("input");
        let closestUploadedClip = $(this).closest("form").find("p.uploaded-clip");
        let closestUploadedContainer = $(this).closest("form").find("div.uploaded-container");

        closestUploadFile.val("");
        closestUploadedClip.text("");
        closestUploadedContainer.addClass("d-none");
    });

    $(document).on("change", ".upload-clip", function () {
        let closestUploadFile = $(this).closest("form").find("input");
        let closestUploadedClip = $(this).closest("form").find("p.uploaded-clip");
        let closestUploadedContainer = $(this).closest("form").find("div.uploaded-container");
        
        let allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']; // Allowed file extensions
        let files = this.files[0];
        let fileName = files.name;
        let fileExtension = fileName.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {

            Swal.fire({
                icon: "error",
                title: "Invalid file type",
                text: "Please upload jpg, jpeg, png or pdf file only.",
                confirmButtonColor: "#8392ab",
            });

            // closestUploadedClip.attr("title", "Invalid file type. Please upload jpg, jpg or pdf file only.");
            // closestUploadedClip.html('<i class="fas fa-exclamation-triangle text-warning pe-1"></i>Invalid file type. Please upload jpg, jpg or pdf file only.');
            // closestUploadedContainer.removeClass("d-none");
            closestUploadFile.val('');
        } else {
            let files = closestUploadFile[0].files; // Get selected file
            for (let i = 0; i < files.length; i++) {
                closestUploadedClip.attr("title", files[i].name);
                closestUploadedClip.text(files[i].name);
                closestUploadedContainer.removeClass("d-none");
            }
        }

    });

    $(document).on("click", ".reply-clip", function () {
        let closestUploadFile = $(this).closest("form").find("input");
        closestUploadFile.trigger("click");
    });

    $(document).on("click", ".send-reply", function () {
        let replyForm = new FormData();
        let closestUploadFile = $(this).closest("form").find("input");
        let closestTextarea = $(this).closest("form").find("textarea");
        let textareaValue = closestTextarea.val();
        let closestUploadedClip = $(this).closest("form").find("p.uploaded-clip");
        let closestUploadedContainer = $(this) .closest("form") .find("div.uploaded-container");
        let $this = $(this);

        if (closestUploadFile.val()) {
            replyForm.append("file", closestUploadFile[0].files[0]);
        }

        replyForm.append("reply", textareaValue);
        replyForm.append("id", intCommentRowID);
        replyForm.append("replyTo", intReplyToCommentID);
        replyForm.append("conceptID", strCpIdComment);
        replyForm.append("conceptType", strCpTypeComment);

        if (textareaValue) {

             // Fetch options
             const options = {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: replyForm,
            };

            // Perform the fetch request
            fetch('/api/send-reply', options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // or response.text() depending on your response format
            })
            .then(data => {
                // Handle success
                if (data.success) {
                    closestTextarea.val("");
                    closestUploadFile.val("");
                    closestUploadedClip.text("");
                    closestUploadedContainer.addClass("d-none");

                    let indexToRemove =
                        arrReplyToCommentID.indexOf(intReplyToCommentID);
                    arrReplyToCommentID.splice(indexToRemove, 1);
                    getRepliesAfterSend(intReplyToCommentID, $this);
                    intReplyToCommentID = "";
                    objCurrentThreadElement = "";
                    processColumnCells();
                } else {
                    console.error('Failed:', data.error);
                }
            })
            .catch(error => {
                // Handle errors
                console.error('Error:', error);
            })
            .finally(() => {
                // Redirect or perform action after the request completes
            });
        }
    });

  

    $(document).on("click", ".cancel-update-comment", function () {
        let closestDiv = $(this).closest("div.card");
        closestDiv.find(".card-footer .update-actions").hide();
        closestDiv.find(".card-footer .default-actions").show();
        closestDiv.addClass("bg-light").removeClass("bg-white border border-dark");
        
        let closestContentArea = closestDiv.find("textarea");
        let content = '<p class="card-text comment-content">' + strOldContent +'</p>';
        let footerStart = closestDiv.find(".card-footer div.text-start");
        footerStart.empty();
        closestContentArea.replaceWith(content);
        intUpdateReplyID = '';
        strOldContent = '';
        boolRemoveClipUpdate = false;
        closestDiv.find(".card-footer div.text-start").append(htmlReplyList);

        let existingUpload = closestDiv.find("a.comment-clip");
        existingUpload.show();
    });
    
    $(document).on("click", ".edit-comment", function () {
        let commentID = $(this).data("edit-id");
        let closestDiv = $(this).closest("div.card");
        let closestContent = closestDiv.find("p.comment-content").text().trim();
        let closestContentArea = closestDiv.find("p.comment-content");
        let height = closestContentArea.height();
        let editTextarea = '<textarea type="text" class="comment-content border-0" style="resize:none;"></textarea>';
        closestDiv.removeClass("bg-light").addClass("bg-white border border-dark");
        closestContentArea.replaceWith(editTextarea);
        closestDiv.find(".comment-content").val(closestContent).focus();

        let closestTextarea = closestDiv.find(".comment-content");
        closestTextarea.height(height + "px");
        closestDiv.find(".card-footer div.text-end a").hide();

        let footerStart = closestDiv.find(".card-footer div.text-start");

        //store existing list of profile replied to the comment to be returned if cancel button is clicked
        htmlReplyList =  footerStart.html();
        footerStart.find("img").hide();

        strOldContent = closestContent;

        let footerEnd = closestDiv.find(".card-footer div.text-end");
        let clipButton = `<a class='btn btn-sm btn-link p-1 mb-0 update-comment-clip update-actions'>
                                <i class='fas fa-paperclip text-dark' style='font-size:20px;'></i>
                            </a>`;
        let cancelButton = "<button class='btn btn-sm btn-light cancel-update-comment mb-1 update-actions'>Cancel</button>";
        let updateButton = "<button class='btn btn-sm btn-info update-comment mb-1 update-actions'>Update</button>";
        let uploadFile = ` <input type="file" class="d-none update-upload-clip" accept="application/pdf,image/jpeg,image/jpg">
        <div class="d-flex gap-1 border border-secondary d-none update-uploaded-container" style="max-width:200px">
        <p class="p-1 mb-0 text-dark px-2 text-truncate update-uploaded-clip"></p>
        <button type="button" class="btn-close text-danger font-weight-bold update-remove-clip" aria-label="Close">x</button>
        </div>`;

        footerStart.append(uploadFile);
        footerEnd.append(clipButton);
        footerEnd.append(cancelButton);
        footerEnd.append(updateButton);
        intUpdateCommentID = commentID;

        let existingUpload = closestDiv.find("a.comment-clip");
        let existingUploadFile = existingUpload.text();
        if(existingUploadFile){
            let closestUploadedClip = closestDiv.find("p.update-uploaded-clip");
            let closestUploadedContainer = closestDiv.find("div.update-uploaded-container");
            closestUploadedClip.text(existingUploadFile);
            closestUploadedClip.attr("title", existingUploadFile);
            closestUploadedContainer.removeClass("d-none");
            existingUpload.hide();
        }else{
            htmlDownloadClip = '';
        }
    });
    
    $(document).on("click", ".update-comment", function () {
        let closestDiv = $(this).closest("div.card");
        let closestContentArea = closestDiv.find("textarea");
        let closestTextareaValue = closestContentArea.val();
        let closestUploadFile = closestDiv.find("input");
        let footerStart = closestDiv.find(".card-footer div.text-start");
        let replyForm = new FormData();

        if (closestUploadFile.val()) {
            replyForm.append("file", closestUploadFile[0].files[0]);
        }

        replyForm.append("id", intUpdateCommentID);
        replyForm.append("content", closestTextareaValue);
        replyForm.append("removeClip", boolRemoveClipUpdate);

        // Fetch options
        const options = {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: replyForm,
        };

        // Perform the fetch request
        fetch('/api/update-comment-reply', options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // or response.text() depending on your response format
        })
        .then(data => {
            // Handle success
            if (data.success) {
                closestDiv.find(".card-footer .update-actions").hide();
                closestDiv.find(".card-footer .default-actions").show();
                closestDiv.addClass("bg-light").removeClass("bg-white border border-dark");

                let content = '<p class="card-text comment-content">' + closestTextareaValue +'</p>';
                closestContentArea.replaceWith(content);
                footerStart.empty();

                if (closestUploadFile.val()) {
                    let fileName = closestUploadFile[0].files[0].name;
                    let fileExtension = fileName.split('.').pop().toLowerCase();
                    let downloadLink = response.file;
                    let icon = (fileExtension == 'pdf') ? '<i class="fas fa-file-pdf text-danger me-1" style="font-size:14px"></i>' : '<i class="far fa-file-image text-danger me-1" style="font-size:14px"></i>';
                    let downloadButton = `<a href="${app_url}/storage/comments/${downloadLink}" 
                    class="btn btn-sm btn-light mb-0 rounded-pill font-weight-normal px-3 border border-secondary text-truncate text-xs shadow-none comment-clip" 
                    style="max-width:150px" 
                    target="_blank" title="${fileName}">${icon} ${fileName}</a>`;
                    closestDiv.find(".comment-content").after(downloadButton);
                }else{

                    let existingUpload = closestDiv.find("a.comment-clip");

                    if(boolRemoveClipUpdate == true){
                        existingUpload.remove();
                    }else{
                        existingUpload.show();
                    }
                }

                closestDiv.find(".card-footer div.text-start").append(htmlReplyList);

                
                intUpdateCommentID = '';
                processColumnCells();
                boolRemoveClipUpdate = false;
            } else {
                console.error('Failed:', error);
            }
        })
        .catch(error => {
            // Handle errors
            console.error('Error:', error);
        })
        .finally(() => {
            // Redirect or perform action after the request completes
        });
    });

    $(document).on("click", ".update-comment-clip", function () {
        let closestUploadFile = $(this).closest("div.card").find("input");
        closestUploadFile.trigger("click");
    });

    



    $(document).on('input', ".comment-content", function(){
        autoResize(this);
    });

    $(document).on("click", ".reply-comment", function () {
        intReplyToCommentID = $(this).data("comment-id");
        objCurrentThreadElement = this;
        if (itemExists(intReplyToCommentID)) {
        } else {
            getReplies(intReplyToCommentID, this);
        }
    });

    $(document).on("click", "#comments .comment-textarea", function () {
        intReplyToCommentID = $(this)
            .closest("div.reply-list")
            .prev(".card")
            .find("a.reply-comment")
            .data("comment-id");
    });

    $("#comment-clip").on("click", function () {
        $("#upload-clip").trigger("click");
    });

    $(document).on("click", ".delete-comment", function () {
        let closestDiv = $(this).closest("div.card");
        let commentID = $(this).data("delete-id");

        Swal.fire({
            title: "Are you sure you want to delete this comment?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ea0606",
            cancelButtonColor: "#8392ab",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        }).then((result) => {
            if (result.isConfirmed == true) {

                const options = {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                };
            
                fetch("/api/delete-comment/" + commentID, options)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json(); // If the server returns JSON, you can parse it here
                })
                .then((data) => {
                    if(data.success){
                        closestDiv.next().remove();
                        closestDiv.remove();
                        // Handle successful response data, if needed
                        console.log("Record deleted successfully,");
                        processColumnCells();
                    }else{
                        console.error("Failed:", data.error);
                    }
                })
                .catch((error) => {
                    // Handle errors here
                    console.error("Error:", error);
                });
            }
        });
    });

    var commentForm = new FormData();
    // When files are selected, handle the change event
    $("#upload-clip").on("change", function (e) {
        var allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']; // Allowed file extensions
        var files = this.files[0];
        var fileName = files.name;
        var fileExtension = fileName.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {

            Swal.fire({
                icon: "error",
                title: "Invalid file type",
                text: "Please upload jpg, jpeg, png or pdf file only.",
                confirmButtonColor: "#8392ab",
            });

            // $("#uploaded-clip").attr("title", "Invalid file type. Please upload jpg, jpg or pdf file only.");
            // $("#uploaded-clip").html('<i class="fas fa-exclamation-triangle text-warning pe-1"></i>Invalid file type. Please upload jpg, jpg or pdf file only.');
            // $("#uploaded-container").removeClass("d-none");
            $("#upload-clip").val('');
            commentForm.delete("file"); // Removes the data associated with 'key2'
        } else {
            var files = $(this)[0].files; // Get selected files
            commentForm.append("file", $(this)[0].files[0]);

            for (var i = 0; i < files.length; i++) {
                $("#uploaded-clip").attr("title", files[i].name);
                $("#uploaded-clip").text(files[i].name);
                $("#uploaded-container").removeClass("d-none");
            }
        }
    });

    $("#remove-clip").on("click", function () {
        $("#upload-clip").val("");
        $("#uploaded-clip").text("");
        $("#uploaded-container").addClass("d-none");
        commentForm.delete("file"); // Removes the data associated with 'key2'
    });

    $("#send-comment").on("click", function () {
        if ($("#comment").val()) {

            var fileInput = $("#upload-clip");
        
            if (fileInput.val()) {
                commentForm.append("file", fileInput[0].files[0]);
            }

            commentForm.append("comment", $("#comment").val());
            commentForm.append("id", intCommentRowID);
            commentForm.append("conceptID", strCpIdComment);
            commentForm.append("conceptType", strCpTypeComment);

            // Fetch options
            const options = {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    // "Content-Type": "application/json"
                },
                body: commentForm,
            };

            // Perform the fetch request
            fetch('/api/send-comment', options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // or response.text() depending on your response format
            })
            .then(data => {
                // Handle success
                if (data.success) {
                    boolFirstComment = true;
                    getComments(
                        intCommentRowID,
                        strCpIdComment,
                        strCpTypeComment,
                        0
                    );
                    $("#commentForm")[0].reset();
                    arrReplyToCommentID = [];
                    commentForm = new FormData();
                    $("#upload-clip").val("");
                    $("#uploaded-clip").text("");
                    $("#uploaded-container").addClass("d-none");

                    if(intCollapseProgramIndex > 0){
                        //update latest comment in projects under program
                        $(strCurrentTable + ' tbody tr[data-unique-id="child_' + strCpIdComment + '"]' ).remove();
                        $(strCurrentTable + ' tbody tr:eq('+ (intCollapseProgramIndex - 1) +')').each(function() {
                            let uncollapseButton = $(this).find("i.uncollapse-program");
                            uncollapseButton.toggleClass("uncollapse-program collapse-program");
                            uncollapseButton.toggleClass("fa-caret-square-up fa-caret-square-down");
                            
                            let collapseButton = $(this).find("i.collapse-program");
                            collapseButton.click();
                        });
                    }else{
                        processColumnCells();
                    }
                } else {
                    console.error('Failed:', error);
                }
            })
            .catch(error => {
                // Handle errors
                console.error('Error:', error);
            })
            .finally(() => {
                // Redirect or perform action after the request completes
            });
        }
    });

});


// this function will display the modal and retreive comm
function addComment(rowID, cpID, cpType, isOpened, isReplyTo) {
arrReplyToCommentID = [];
intCommentRowID = rowID;
strCpIdComment = cpID;
strCpTypeComment = cpType;


if (isOpened == 0) {

    const options = {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    };

    fetch("/api/open-comment/" + rowID + "/" + cpID + "/" + cpType, options)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json(); // If the server returns JSON, you can parse it here
    })
    .then((data) => {
        if(data.success){
            console.log("Success");
        }else{
            console.error("Failed:", data.error);
        }
    })
    .catch((error) => {
        // Handle errors here
        console.error("Error:", error);
    });

    // fetch("/open-comment/" + rowID + "/" + cpID + "/" + cpType, {
    //     method: "GET",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
    //     },
    // })
    //     .then((response) => {
    //         if (!response.ok) {
    //             throw new Error("Network response was not ok");
    //         }
    //         // return response.json(); // parse response body as JSON
    //     })
    //     .then((data) => {
    //         console.log("Success:", data);
    //     })
    //     .catch((error) => {
    //         console.error("Error:", error);
    //     });
}

var targetRowIndex = -1; // Initialize with an invalid index
var childID;
$("table tbody tr").each(function(index){
    if ($(this).find('td[data-proj-id="' + rowID + '"]').length > 0) {
        targetRowIndex = index; // Get the index of the matching row
        return false; // Exit the each loop
    }
});

$("table tbody tr:eq(" + targetRowIndex +")").each(function(){
childID = $(this).data("unique-id");

});

intCollapseProgramIndex = (childID == undefined) ? 0 : 1;

getComments(rowID, cpID, cpType, isReplyTo);


$("#commentsModal").modal("toggle");
}

// this function will get all comments
async function getComments(rowID, cpID, cpType, isReplyTo) {
showLoading();    
// Fetch options
const options = {
    method: 'GET',
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    },
};

// Perform the fetch request
fetch("/api/get-comments/" + rowID + "/" + cpID + "/" + cpType, options)
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // or response.text() depending on your response format
})
.then(async (data) => {
    // Handle success
    if(data.success){

        var response = data.output;

        if(response.length == 1){
            boolFirstComment = true;
        }
        
        
    let element = $("#comments");
    let strCommentContent = "";

    for (let i = 0; i < response.length; i++) {
        let value = response[i];
        let data = await getReplyCount(value.cmt_id, cpID, cpType);
        let profiles = data["users"];
        let profilesList = "";
        let profileLimit = 0;

        if (profiles.length > 0) {
            $.each(profiles, function (key, value) {
                profileLimit++;
                if (profileLimit <= 5) {
                    let src =
                        value.usr_image != "default-avatar.png"
                            ? app_url +
                                "/storage/public/profiles/" +
                                value.usr_image
                            : app_url +
                                "/assets/img/default-avatar.png";
                    // profilesList +=
                    //     `<img src="` +
                    //     src +
                    //     `" alt="Image" class=" border rounded-circle" style="height:auto; width:auto; max-height:28px; max-width:30px">`;
                }

                // if (profileLimit > 5) {
                //     profilesList +=
                //         '<span class="badge bg-light border border-secondary text-dark rounded-circle px-2" style="height:auto; width:auto; max-height:28px; max-width:30px">' +
                //         (profileLimit - 5) +
                //         "+</span>";
                // }
            });
        }

        let attachment =
            value.cmt_original_file_name != null
                ? value.cmt_original_file_name
                : "";
        if (value.cmt_original_file_name != null) {
            let fileType = attachment.split(".");
            var icon =
                fileType[1] == "pdf"
                    ? '<i class="fas fa-file-pdf text-danger me-1" style="font-size:14px"></i>'
                    : '<i class="far fa-file-image text-danger me-1" style="font-size:14px"></i>';
        }

        let countReplies = data["replies"];
        let countAttachments = data["attachments"];
        let src =
            value.usr_image != "default-avatar.png"
                ? app_url +
                    "/storage/public/profiles/" +
                    value.usr_image
                : app_url + "/assets/img/default-avatar.png";

        let href =
            value.cmt_attachment != null
                ? app_url + "/storage/comments/" + value.cmt_attachment
                : "javascript:void(0);";
        let download =
            value.cmt_attachment != null
                ? '<a href="' +
                    href +
                    '" class="btn btn-sm btn-light rounded-pill font-weight-normal px-3 border border-secondary text-truncate text-xs shadow-none comment-clip mb-0" style="max-width:150px" target="_blank" title="' +
                    attachment +
                    '"">' +
                    icon +
                    "" +
                    attachment +
                    "</a>"
                : "";
        
    // let clip =
    // value.cmt_attachment != null
    //     ? `<a class="btn btn-sm btn-link p-1 mb-1 text-dark default-actions" style="cursor:pointer" title="Attachments"><i class="fa fa-paperclip text-dark bg-info rounded-circle p-1 me-1" style="font-size:18px"></i><span class="count-attachments">`;
        
    //     '<a href="' +
    //         href +
    //         '" class="btn btn-sm btn-light rounded-pill font-weight-normal px-3 border border-secondary text-truncate text-xs shadow-none comment-clip" style="max-width:150px" target="_blank" title="' +
    //         attachment +
    //         '"">' +
    //         icon +
    //         "" +
    //         attachment +
    //         "</a>"
    //     : "";
        let deleteButton =  value.added_by_logged_in_user == "true"
                            ? `<a class="delete-comment btn btn-sm btn-link p-1 pt-2 mb-0" style="cursor:pointer;" title="Delete" data-delete-id=` +
                                        value.cmt_id +
                                        `><i class="fa fa-trash-o text-dark" style="font-size:18px"></i></a>`
                            : "";
        let editButton =
                value.added_by_logged_in_user == "true"
                    ? `
                     <a class="btn btn-sm btn-link edit-comment p-1 mb-0 default-actions" data-edit-id=` +
                                        value.cmt_id +
                                        ` style="cursor:pointer;"><i class="fas fa-pen text-dark p-1" style="font-size:18px"></i></a>`
                    : "";

        strCommentContent +=
            `<div class="card text-dark bg-light mb-2 w-100 p-0 border shadow-none">
                                <div class="card-body d-flex gap-2 mb-0 p-2">
                                    <img src="` +
            src +
            `" alt="Image" class=" rounded-circle" style="height:auto; width:auto; max-height:45px; max-width:48px">
                                    
                                    <div class="d-flex flex-column col" style="width:inherit !important">
                                        <div class="d-flex justify-content-between">
                                            <div class="card-title">
                                                ` +
            value.first_name +
            ` ` +
            value.last_name +
            `
                                                <span class="text-xs text-white bg-secondary rounded-pill px-2">` +
            value.utype_desc +
            `</span>
                                            </div>
                                            <div class="text-end text-muted text-sm">` +
            moment(value.cmt_dt_added).format("DD MMMM Y") +
            ` | 
                                            ` +
            moment(value.cmt_dt_added).format("hh:mm A") +
            `</div>
                                        </div>
                                        <p class="card-text comment-content me-3">
                                        ` +
            value.cmt_content +
            `
                                        </p>
                                        ` +
            // download +
            `
                                    </div>
                                </div>
                                <div class="card-footer d-flex justify-content-between p-2">
                                    <div class="text-start reply-profile ms-5 d-flex">` +
            // profilesList +  
            download +

            `</div>
                                    <div class="text-end d-flex gap-1 mb-0">
                                        <a class="btn btn-sm btn-link p-1 pt-2 mb-0 reply-comment default-actions" title="Reply" data-comment-id=` +
                                        value.cmt_id +
                                        ` style="cursor:pointer"><i class="fa fa-reply text-dark" style="font-size:18px"></i></a>` +
                                        editButton +
                                        // clip +
                                        // countAttachments +
                                        deleteButton +
                                        `<a class="btn btn-sm btn-link p-1 mb-0 text-dark reply-comment default-actions" title="Replies" data-comment-id=` +
                                        value.cmt_id +
                                        ` style="cursor:pointer"><i class="far fa-comments text-dark bg-danger rounded-circle p-1 me-1" style="font-size:18px"></i><span class="count-replies">` +
                                        countReplies +
                                        `</span></a>
                                        
                                    </div>
                                </div>
                            </div><div class="reply-list"></div>`;
    }

        //archive button
        // <a class="archive-comment" style="cursor:pointer" title="Archive" data-archive-id=` +
        //         value.cmt_id +
        //         `><i class="fas fa-archive text-dark rounded-circle p-1"></i><span ></span></a>

        element.html(strCommentContent);
        element.scrollTop(element.prop("scrollHeight"));

        if (isReplyTo > 0) {
            $(
                'a.reply-comment[data-comment-id="' + isReplyTo + '"]'
            ).trigger("click");
        }
    }else{
        console.error('Failed:', error);
    }
})
.catch(error => {
    // Handle errors
    console.error('Error:', error);
    reject(error);
})
.finally(() => {
    // Redirect or perform action after the request completes
    stopLoading();
});

// fetch("/get-comments/" + rowID + "/" + cpID + "/" + cpType, {
//     method: "GET",
//     headers: {
//         "Content-Type": "application/json",
//         "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
//     },
// })
// .then(function (response) {
//     if (!response.ok) {
//         throw new Error("Failed to upload file");
//     }
//     return response.json();
// })
// .then(async (response) => {
//     // console.log(response);
//     if(response.length == 1){
//         boolFirstComment = true;
//     }

//     stopLoading();
// })
// .catch((error) => {
//     console.error("Error:", error);
//     reject(error);
//     // Handle error
// }).finally(() => {
//     // if(intFilterIdentifier == 3){
//     //     $(".reply-comment").hide();
//     // }else{
//     //     $(".reply-comment").show();
//     // }
// });
}

// this function will get all replies after sending a reply to a comment
async function getRepliesAfterSend(id, element) {

// Fetch options
const options = {
    method: 'GET',
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    },
};

// Perform the fetch request
await fetch('/api/get-replies/' + id, options)
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // or response.text() depending on your response format
})
.then(data => {
    // Handle success
    if (data.success) {
        let currentProfilePhoto = $("#comment-profile-photo").attr("src");
        let newElement = "";
        var response = data;
        //show replies
        if (response.output.length > 0) {
            $.each(response.output, function (key, value) {
                let src =
                    value.usr_image != "default-avatar.png"
                        ? app_url +
                          "/storage/public/profiles/" +
                          value.usr_image
                        : app_url + "/assets/img/default-avatar.png";

                let attachment =
                    value.cmt_original_file_name != null
                        ? value.cmt_original_file_name
                        : "";

                if (value.cmt_original_file_name != null) {
                    let fileType = attachment.split(".");
                    var icon =
                        fileType[1] == "pdf"
                            ? '<i class="fas fa-file-pdf text-danger me-1" style="font-size:14px"></i>'
                            : '<i class="far fa-file-image text-danger me-1" style="font-size:14px"></i>';
                }

                // let countAttachments =
                //     value.cmt_attachment != null ? "1" : "0";

                let href =
                    value.cmt_attachment != null
                        ? app_url +
                          "/storage/comments/" +
                          value.cmt_attachment
                        : "javascript:void(0);";

                let download =
                    value.cmt_attachment != null
                        ? '<a href="' +
                          href +
                          '" class="btn btn-sm btn-light rounded-pill font-weight-normal px-3 border border-secondary text-truncate text-xs shadow-none" style="max-width:150px" target="_blank" title="' +
                          attachment +
                          '">' +
                          icon +
                          "" +
                          attachment +
                          "</a>"
                        : "";

                let actionButtons =
                    value.added_by_logged_in_user == "true"
                        ? `
                        <a class="btn btn-sm btn-link p-1 edit-reply mb-0 default-actions" data-edit-id=` +
                        value.cmt_id +
                        ` style="cursor:pointer"><i class="fas fa-pen text-dark p-1" style="font-size:18px"></i></a>
                <a class="btn btn-sm btn-link p-1 delete-reply default-actions mb-0" data-delete-id=` +
                          value.cmt_id +
                          ` style="cursor:pointer"><i class="fa fa-trash-o text-dark p-1" style="font-size:18px"></i></a>`
                        : "";

                newElement +=
                    `<div class="row">
                                    <div class="col align-self-start "></div>
                                        <div class="col col-10 align-self-end border border-3 border-top-0 border-bottom-0 border-end-0 border-light ps-5">
                                            <div class="card text-dark bg-light mb-2 w-100 p-0 border shadow-none">
                                                <div class="card-body d-flex gap-2 mb-0 p-2">
                                                    <img src="` +
                    src +
                    `" alt="Image" class=" rounded-circle"  style="height:auto; width:auto; max-height:45px; max-width:48px">
                                                
                                                    <div class="d-flex flex-column col" style="width:inherit !important">
                                                        <div class="d-flex justify-content-between">
                                                            <div class="card-title">
                                                                ` +
                    value.first_name +
                    ` ` +
                    value.last_name +
                    `
                                                                <span class="text-xs text-white bg-secondary px-1 rounded-pill px-2">` +
                    value.utype_desc +
                    `</span>
                                                            </div>
                                                            <div class="text-end text-muted text-xs">` +
                    moment(value.cmt_dt_added).format("DD MMMM Y") +
                    ` | 
                                                            ` +
                    moment(value.cmt_dt_added).format("hh:mm A") +
                    `</div>
                                                        </div>
                                                        <p class="card-text me-3">
                                                        ` +
                    value.cmt_content +
                    `
                                                        </p>
                                                        </div>
                                                </div>
                                                
                                                <div class="card-footer d-flex justify-content-between p-2 mb-0">
                                                    <div class="text-start ps-5">
                                                        ` + download + `
                                                    </div>
                                                    <div class="text-end pt-2 d-flex gap-1">
                                                    ` + actionButtons + `
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
            });
        }


        // <a class="default-actions pt-1" style="cursor:pointer"><i class="fa fa-paperclip text-dark bg-info rounded-circle p-1"></i> <span class="reply-attachment">` +
        // countAttachments + `</span>
        // </a>


        // append reply section
        arrReplyToCommentID.push(id);

        newElement +=
            `<div class="row mb-2">
                        <div class="col align-self-start "></div>
                            <div class="col col-10 align-self-end border border-3 border-top-0 border-bottom-0 border-end-0 border-light ps-5">
                                <div class="d-flex gap-2">
                                    <img src="` +
            currentProfilePhoto +
            `" alt="Image"
                                        class=" img-fluid rounded-circle" style="width:7%; height:7%">
                                    <div class="border w-100 border border-dark">
                                        <form id="replyForm" enctype="multipart/form-data">
                                            <textarea class="form-control comment-textarea" style="border:0" name="comment" oninput="autoResize(this)" placeholder="Reply to this thread..."></textarea>
                                            <div class="p-1">
                                                <div class="d-flex justify-content-between">
                                                    <div class="text-start mb-0">
                                                        <input type="file" class="d-none upload-clip" accept="application/pdf,image/jpeg,image/jpg">
                                                        <div class="d-flex gap-1 border border-secondary d-none uploaded-container" style="max-width:250px">
                                                        <p class="p-1 mb-0 text-dark px-2 uploaded-clip"></p>
                                                        <button type="button" class="btn-close text-danger font-weight-bold remove-clip" aria-label="Close">x</button>
                                                        </div>
                                                    </div>
                                                    <div class="text-end mb-0 mt-1">
                                                        <a class="btn btn-sm btn-link p-1 mb-0 reply-clip">
                                                            <i class="fas fa-paperclip text-dark" style="font-size:20px;"></i>
                                                        </a>
                                                        <a class="btn btn-sm btn-link p-1 mb-0 send-reply">
                                                            <i class="fas fa-paper-plane text-info" style="font-size:20px;"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>`;

        // Find the closest parent with class 'parent'
        let closestParent = $(element).closest("div.reply-list");
        let closestCountAttachments = $(element)
            .closest("div.reply-list")
            .prev(".card")
            .find("span.count-attachments");
        let closestCountReplies = $(element)
            .closest("div.reply-list")
            .prev(".card")
            .find("span.count-replies");

        // Append the new element to the closest parent
        closestParent.html(newElement);
        closestCountAttachments.text(response.attachments);
        closestCountReplies.text(response.replies);
    }else{
        console.error('Failed:', data.error);
    }
})
.catch(error => {
    // Handle errors
    console.error('Error:', error);
})
.finally(() => {
    // Redirect or perform action after the request completes
});
}

// this function will get replies when left arrow icon or reply count is clicked
async function getReplies(id, element) {
// Fetch options
const options = {
    method: 'GET',
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    },
};

// Perform the fetch request
await fetch('/api/get-replies/' + id, options)
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // or response.text() depending on your response format
})
.then(data => {
    // Handle success
    if (data.success) {
        var response = data;
        let currentProfilePhoto = $("#comment-profile-photo").attr("src");
        let newElement = "";
        //show replies
        if (response.output.length > 0) {
            $.each(response.output, function (key, value) {
                let src =
                    value.usr_image != "default-avatar.png"
                        ? app_url +
                          "/storage/public/profiles/" +
                          value.usr_image
                        : app_url + "/assets/img/default-avatar.png";

                let attachment =
                    value.cmt_original_file_name != null
                        ? value.cmt_original_file_name
                        : "";

                if (value.cmt_original_file_name != null) {
                    let fileType = attachment.split(".");
                    var icon =
                        fileType[1] == "pdf"
                            ? '<i class="fas fa-file-pdf text-danger me-1" style="font-size:14px"></i>'
                            : '<i class="far fa-file-image text-danger me-1" style="font-size:14px"></i>';
                }

                // let countAttachments =
                //     value.cmt_attachment != null ? "1" : "0";

                let href =
                    value.cmt_attachment != null
                        ? app_url +
                          "/storage/comments/" +
                          value.cmt_attachment
                        : "javascript:void(0);";
                let download =
                    value.cmt_attachment != null
                        ? '<a href="' +
                          href +
                          '" class="btn btn-sm btn-light mb-0 rounded-pill font-weight-normal px-3 border border-secondary text-truncate text-xs shadow-none" style="max-width:150px" target="_blank" title="' +
                          attachment +
                          '">' +
                          icon +
                          "" +
                          attachment +
                          "</a>"
                        : "";

                let actionButtons =
                    value.added_by_logged_in_user == "true"
                        ? `
                        <a class="btn btn-sm btn-link edit-reply p-1 mb-0 default-actions" data-edit-id=` +
                            value.cmt_id +
                            ` style="cursor:pointer;"><i class="fas fa-pen text-dark p-1" style="font-size:18px"></i></a>
                        <a class="btn btn-sm btn-link delete-reply p-1 mb-0 default-actions" data-delete-id=` +
                            value.cmt_id +
                            ` style="cursor:pointer"><i class="fa fa-trash-o text-dark p-1" style="font-size:18px"></i></a>`
                        : "";

                newElement +=
                    `<div class="row">
                                    <div class="col align-self-start "></div>
                                        <div class="col col-10 align-self-end border border-3 border-top-0 border-bottom-0 border-end-0 border-light ps-5">
                                            <div class="card text-dark bg-light mb-2 w-100 p-0 border shadow-none">
                                                <div class="card-body d-flex gap-2 mb-0 p-2">
                                                    <img src="` +
                    src +
                    `" alt="Image" class=" rounded-circle"  style="height:auto; width:auto; max-height:45px; max-width:48px">
                                                
                                                    <div class="d-flex flex-column col" style="width:inherit !important">
                                                        <div class="d-flex justify-content-between">
                                                            <div class="card-title">
                                                                ` +
                    value.first_name +
                    ` ` +
                    value.last_name +
                    `
                                                                <span class="text-xs text-white bg-secondary px-1 rounded-pill px-2">` +
                    value.utype_desc +
                    `</span>
                                                            </div>
                                                            <div class="text-end text-muted text-xs">` +
                    moment(value.cmt_dt_added).format("DD MMMM Y") +
                    ` | 
                                                            ` +
                    moment(value.cmt_dt_added).format("hh:mm A") +
                    `</div>
                                                        </div>
                                                        <p class="card-text reply-content me-3">
                                                        ` +
                    value.cmt_content +
                    `
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="card-footer d-flex justify-content-between p-2 mb-0">
                                                    <div class="text-start ps-5">
                                                        ` + download + `
                                                    </div>
                                                    <div class="text-end pt-2 d-flex gap-1">
                                                    ` + actionButtons + `
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
            });
        }

        
        // <a class="btn btn-sm btn-link p-1 default-actions mb-0 text-dark" style="cursor:pointer"><i class="fa fa-paperclip text-dark bg-info rounded-circle p-1" style="font-size:18px"></i> <span class="reply-attachment">` +
        // countAttachments + `</span>
        // </a>


        // append reply section
        arrReplyToCommentID.push(id);

        newElement +=
            `<div class="row mb-2">
                        <div class="col align-self-start "></div>
                            <div class="col col-10 align-self-end border border-3 border-top-0 border-bottom-0 border-end-0 border-light ps-5">
                                <div class="d-flex gap-2">
                                    <img src="` +
            currentProfilePhoto +
            `" alt="Image"
                                        class=" img-fluid rounded-circle" style="height:auto; width:auto; max-height:45px; max-width:48px">
                                    <div class="border w-100 border-dark">
                                        <form id="replyForm" enctype="multipart/form-data">
                                            <textarea class="form-control comment-textarea" style="border:0" name="comment" oninput="autoResize(this)" placeholder="Reply to this thread..."></textarea>
                                            <div class="p-1">
                                                <div class="d-flex justify-content-between">
                                                    <div class="text-start mb-0">
                                                        <input type="file" class="d-none upload-clip" accept="application/pdf,image/jpeg,image/jpg">
                                                        <div class="d-flex gap-1 border border-secondary d-none uploaded-container" style="max-width:250px">
                                                        <p class="p-1 mb-0 text-dark px-2 text-truncate uploaded-clip"></p>
                                                        <button type="button" class="btn-close text-danger font-weight-bold remove-clip" aria-label="Close">x</button>
                                                        </div>
                                                    </div>
                                                    <div class="text-end mb-0 mt-1">
                                                        <a class="btn btn-sm btn-link p-1 mb-0 reply-clip">
                                                            <i class="fas fa-paperclip text-dark" style="font-size:20px;"></i>
                                                        </a>
                                                        <a class="btn btn-sm btn-link p-1 mb-0 send-reply">
                                                            <i class="fas fa-paper-plane text-info" style="font-size:20px;"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>`;

        // Find the closest parent with class 'parent'
        let closestParent = $(element).closest(".card");
        let closestCountAttachments = $(element)
            .closest(".card")
            .find(".count-attachments");
        let closestCountReplies = $(element)
            .closest(".card")
            .find(".count-replies");

        // Append the new element to the closest parent
        closestParent.next("div.reply-list").html(newElement);
        closestCountAttachments.text(response.attachments);
        closestCountReplies.text(response.replies);

        let replyList = closestParent.next("div.reply-list");
        let container = $("#comments");
        let scrollTo =
            replyList.prop("scrollHeight") +
            container.offset().top +
            container.scrollTop();
        container.animate(
            {
                scrollTop: scrollTo,
            },
            500
        ); // Adjust the duration as needed
        replyList.find("textarea").trigger("focus");
    }else{
        console.error('Failed:', data.error);
    }
})
.catch(error => {
    // Handle errors
    console.error('Error:', error);
})
.finally(() => {
    // Redirect or perform action after the request completes
});

// await fetch("/get-replies/" + id, {
//     method: "GET",
//     headers: {
//         "Content-Type": "application/json",
//         "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
//     },
// })
//     .then(function (response) {
//         if (!response.ok) {
//             throw new Error("Failed to upload file");
//         }
//         return response.json();
//     })
//     .then((response) => {
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//         // Handle error
//     });
}

// this function counts replies per comments
async function getReplyCount(id, cpID, cpType) {

const options = {
    method: 'GET',
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    },
};

return fetch("/api/count-replies-attachments/" + id + "/" + cpID + "/" + cpType, options)
.then((response) => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json(); // If the server returns JSON, you can parse it here
})
.catch((error) => {
    // Handle errors here
    console.error("Error:", error);
});

// const response = await fetch(
//     "/count-replies-attachments/" + id + "/" + cpID + "/" + cpType
// );
// const data = await response.json();
// return data;
}

// this function auto resizes the field for comment/reply
function autoResize(textarea) {
textarea.style.height = "auto"; // Reset textarea height
textarea.style.height = textarea.scrollHeight + "px"; // Set new height
}