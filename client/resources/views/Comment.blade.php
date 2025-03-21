<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comments</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    
</head>
<body>
    <div class="container mt-5">
        <!-- Comment Modal -->
        <div class="modal fade" id="addCommentModal" tabindex="-1" role="dialog" aria-labelledby="addCommentModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addCommentModalLabel">Add Comment</h5>
                        <button type="button" class="close"     -dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>df
                    </div>
                    <div class="modal-body">
                        <form id="commentForm">
                            <div class="form-group">
                                <textarea id="comment" class="form-control comment-content" rows="3" placeholder="Write your comment here..."></textarea>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <div>
                                    <button type="button" id="comment-clip" class="btn btn-outline-secondary btn-sm">
                                        <i class="fas fa-paperclip"></i> Attach
                                    </button>
                                    <input type="file" id="upload-clip" class="d-none">
                                </div>
                                <div>
                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancel</button>
                                    <button type="button" id="send-comment" class="btn btn-primary btn-sm">Send</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Button to Open the Modal -->
        <button type="button" class="btn btn-primary" onclick="openAddCommentModal(1, 1, 'exampleType')">
            <i class="fas fa-comment"></i> Add Comment
        </button>

        <!-- Comments Section -->
        <div id="comments" class="mt-4">
            <!-- Existing comments will be dynamically inserted here -->
        </div>

        <!-- JavaScript for Opening the Modal and Handling Comments -->
        <script>
            // Define the token variable
            const token = '{{ csrf_token() }}'; // Use Laravel's CSRF token

            // Function to open the comment modal
            function openAddCommentModal(rowID, conceptID, conceptType) {
                // Set global variables for use in your existing code
                window.intCommentRowID = rowID;
                window.strCpIdComment = conceptID;
                window.strCpTypeComment = conceptType;

                // Clear form
                $("#commentForm")[0].reset();
                $("#uploaded-container").addClass("d-none");

                // Open the modal
                $("#addCommentModal").modal("show");
            }

            // Add comment event handler
            $(document).on("click", "#send-comment", function () {
                const commentContent = $("#comment").val();
                const formData = new FormData();
                formData.append("content", commentContent);
                // Add other necessary data to formData

                fetch('/api/add-comment', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${token}`, // Use the defined token
                    },
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Handle success
                    if (data.success) {
                        // Append the new comment to the comments section
                        const newComment = `<div class="card mb-2">
                            <div class="card-body">
                                <p class="card-text">${commentContent}</p>
                            </div>
                        </div>`;
                        $("#comments").prepend(newComment); // Add the new comment at the top
                        $("#addCommentModal").modal("hide"); // Close the modal
                    } else {
                        console.error('Failed:', data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            });
        </script>

        <!-- Update Comment Modal -->
        <div class="modal fade" id="updateCommentModal" tabindex="-1" role="dialog" aria-labelledby="updateCommentModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="updateCommentModalLabel">Edit Comment</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Comment Form -->
                        <form id="updateCommentForm">
                            <div class="form-group">
                                <textarea id="update-comment-content" class="form-control comment-content" rows="3" placeholder="Edit your comment here..."></textarea>
                            </div>
                            <!-- Existing Attachment Display -->
                            <div id="existing-attachment-container" class="mb-2">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-paperclip me-2"></i>
                                    <span id="existing-attachment-name" class="text-truncate"></span>
                                    <button type="button" id="remove-existing-attachment" class="btn btn-link text-danger p-0 ms-2">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <!-- New Attachment Display -->
                            <div id="update-uploaded-container" class="d-none mb-2">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-paperclip me-2"></i>
                                    <span id="update-uploaded-clip" class="text-truncate"></span>
                                    <button type="button" id="update-remove-clip" class="btn btn-link text-danger p-0 ms-2">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <div>
                                    <button type="button" id="update-comment-clip" class="btn btn-outline-secondary btn-sm">
                                        <i class="fas fa-paperclip"></i> Attach
                                    </button>
                                    <input type="file" id="update-upload-clip" class="d-none" accept="application/pdf,image/jpeg,image/jpg">
                                </div>
                                <div>
                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cancel</button>
                                    <button type="button" id="update-comment-btn" class="btn btn-primary btn-sm">Update</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Global variables to store update information
            let intUpdateCommentID = '';
            let strOldContent = '';
            let boolRemoveClipUpdate = false;
            let existingAttachmentName = '';
            let existingAttachmentURL = '';

            // Function to open the update comment modal
            function openUpdateCommentModal(commentID, content, attachmentName = '', attachmentURL = '') {
                // Set global variables for update
                intUpdateCommentID = commentID;
                strOldContent = content;
                existingAttachmentName = attachmentName;
                existingAttachmentURL = attachmentURL;
                boolRemoveClipUpdate = false;

                // Set form values
                $("#update-comment-content").val(content);

                // Handle existing attachment
                if (attachmentName) {
                    $("#existing-attachment-name").text(attachmentName);
                    $("#existing-attachment-name").attr("title", attachmentName);
                    $("#existing-attachment-container").removeClass("d-none");
                } else {
                    $("#existing-attachment-container").addClass("d-none");
                }

                // Reset new attachment form
                $("#update-upload-clip").val('');
                $("#update-uploaded-clip").text('');
                $("#update-uploaded-container").addClass("d-none");

                // Open the modal
                $("#updateCommentModal").modal("show");

                // Auto-resize textarea
                autoResize(document.getElementById("update-comment-content"));
            }

            // Event handler for attaching a new file
            $("#update-comment-clip").on("click", function () {
                $("#update-upload-clip").trigger("click");
            });

            // When a new file is selected for update
            $("#update-upload-clip").on("change", function (e) {
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

                    $("#update-upload-clip").val('');
                } else {
                    $("#update-uploaded-clip").attr("title", fileName);
                    $("#update-uploaded-clip").text(fileName);
                    $("#update-uploaded-container").removeClass("d-none");

                    // Hide existing attachment container if there was one
                    $("#existing-attachment-container").addClass("d-none");
                    boolRemoveClipUpdate = true;
                }
            });

            // Remove new attachment
            $("#update-remove-clip").on("click", function () {
                $("#update-upload-clip").val("");
                $("#update-uploaded-clip").text("");
                $("#update-uploaded-container").addClass("d-none");

                // If there was an existing attachment, show it again
                if (existingAttachmentName) {
                    $("#existing-attachment-container").removeClass("d-none");
                    boolRemoveClipUpdate = false;
                }
            });

            // Remove existing attachment
            $("#remove-existing-attachment").on("click", function () {
                $("#existing-attachment-container").addClass("d-none");
                boolRemoveClipUpdate = true;
            });

            // Update comment submit button
            $("#update-comment-btn").on("click", function () {
                const updatedContent = $("#update-comment-content").val();

                if (!updatedContent.trim()) {
                    Swal.fire({
                        icon: "error",
                        title: "Empty Comment",
                        text: "Comment cannot be empty.",
                        confirmButtonColor: "#8392ab",
                    });
                    return;
                }

                // Create FormData object for the update
                const updateForm = new FormData();

                // Add file if a new one was selected
                if ($("#update-upload-clip").val()) {
                    updateForm.append("file", $("#update-upload-clip")[0].files[0]);
                }

                // Add other data
                updateForm.append("id", intUpdateCommentID);
                updateForm.append("content", updatedContent);
                updateForm.append("removeClip", boolRemoveClipUpdate);

                // Show loading state
                const button = $(this);
                const originalText = button.text();
                button.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...');

                // Fetch options
                const options = {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    body: updateForm,
                };

                // Perform the fetch request
                fetch('/api/update-comment-reply', options)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Handle success
                        if (data.success) {
                            // Close modal
                            $("#updateCommentModal").modal("hide");

                            // Reset global variables
                            intUpdateCommentID = '';
                            strOldContent = '';
                            boolRemoveClipUpdate = false;

                            // Optionally refresh comments if needed
                            if (typeof processColumnCells === 'function') {
                                processColumnCells();
                            }

                            // Show success message
                            Swal.fire({
                                icon: "success",
                                title: "Comment Updated",
                                text: "Your comment has been updated successfully.",
                                confirmButtonColor: "#8392ab",
                                timer: 1500,
                                showConfirmButton: false
                            });
                        } else {
                            throw new Error(data.error || "Failed to update comment");
                        }
                    })
                    .catch(error => {
                        // Handle errors
                        console.error("Error:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Update Failed",
                            text: "Failed to update comment. Please try again.",
                            confirmButtonColor: "#8392ab",
                        });
                    })
                    .finally(() => {
                        // Reset button state
                        button.prop("disabled", false).text(originalText);
                    });
            });

            // Modal close event to reset form
            $("#updateCommentModal").on("hidden.bs.modal", function() {
                $("#updateCommentForm")[0].reset();
                $("#update-upload-clip").val("");
                $("#update-uploaded-clip").text("");
                $("#update-uploaded-container").addClass("d-none");
                $("#existing-attachment-container").addClass("d-none");

                // Reset global variables
                intUpdateCommentID = '';
                strOldContent = '';
                boolRemoveClipUpdate = false;
                existingAttachmentName = '';
                existingAttachmentURL = '';
            });
        </script>

        <!-- Reply Modal -->
        <div class="modal fade" id="replyModal" tabindex="-1" aria-labelledby="replyModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="replyModalLabel">Add Reply</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form class="reply-form">
                            <div class="mb-3">
                                <textarea class="form-control" rows="4" placeholder="Write your reply..."></textarea>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <input type="file" class="upload-clip d-none">
                                    <button type="button" class="btn btn-sm btn-outline-secondary reply-clip">
                                        <i class="fas fa-paperclip"></i> Attach
                                    </button>
                                    <div class="uploaded-container d-none">
                                        <p class="uploaded-clip mb-0"></p>
                                        <button type="button" class="btn btn-sm text-danger remove-clip">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-primary send-reply">
                                    <i class="fas fa-paper-plane"></i> Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>