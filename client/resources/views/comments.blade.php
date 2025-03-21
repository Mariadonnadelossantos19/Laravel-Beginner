<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Comment System</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .comment-container {
            margin-bottom: 20px;
        }
        .comment {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .reply {
            margin-left: 40px;
            background-color: #f0f2f5;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
        }
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        .comment-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .comment-info {
            margin-left: 10px;
        }
        .commenter-name {
            font-weight: bold;
            margin-bottom: 0;
        }
        .comment-date {
            font-size: 0.8rem;
            color: #666;
        }
        .comment-actions {
            font-size: 0.85rem;
        }
        .comment-actions a {
            margin-right: 10px;
            text-decoration: none;
        }
        .attachment-card {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 8px;
            margin-bottom: 10px;
        }
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1050;
        }
        #loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container py-5">
        <h2>Comments</h2>
        <hr>

        <!-- Comment Form -->
        <div class="mb-4">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#commentModal">
                <i class="fas fa-comment-dots me-2"></i>Add Comment
            </button>
        </div>

        <!-- Comments Area -->
        <div id="comments-container" class="row">
            
            <!-- Comments will be dynamically loaded here -->
        </div>

        <!-- Comment Modal -->
        <div class="modal fade" id="commentModal" tabindex="-1" aria-labelledby="commentModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="commentModalLabel">Add Comment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="comment-form">
                            <div class="mb-3">
                                <label for="comment-text" class="form-label">Your Comment</label>
                                <textarea class="form-control" id="comment-text" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="comment-file" class="form-label">Attachment (optional)</label>
                                <input type="file" id="comment-file" name="file" class="form-control">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="submit-comment">Submit</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Spinner -->
        <div id="loading">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Load comments on page load
            loadComments();

            // Submit comment
            document.getElementById('submit-comment').addEventListener('click', function() {
                const formData = new FormData(document.getElementById('comment-form'));
                const commentText = document.getElementById('comment-text').value;

                if (!commentText) {
                    alert('Comment cannot be empty.');
                    return;
                }

                // Show loading spinner
                document.getElementById('loading').style.display = 'flex';

                fetch('{{ route('comments.store') }}', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Hide loading spinner
                    document.getElementById('loading').style.display = 'none';

                    if (data.success) {
                        // Reload comments
                        loadComments();
                        // Close modal
                        $('#commentModal').modal('hide');
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('loading').style.display = 'none';
                });
            });
        });

        function loadComments() {
            fetch('{{ route('comments.show', ['id' => 1, 'cpID' => 'example_cpID', 'cpType' => 'example_cpType']) }}')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    const commentsContainer = document.getElementById('comments-container');
                    commentsContainer.innerHTML = ''; // Clear existing comments

                    data.comments.forEach(comment => {
                        const commentDiv = document.createElement('div');
                        commentDiv.className = 'comment-container';
                        commentDiv.innerHTML = `
                            <div class="comment">
                                <h6>${comment.cmt_added_by}</h6>
                                <p>${comment.cmt_content}</p>
                                ${comment.cmt_attachment ? `<a href="/uploads/${comment.cmt_attachment}" target="_blank">${comment.cmt_attachment}</a>` : ''}
                                <small>${new Date(comment.cmt_dt_added).toLocaleString()}</small>
                            </div>
                        `;
                        commentsContainer.appendChild(commentDiv);
                    });
                })
                .catch(error => console.error('Error loading comments:', error));
        }
    </script>
</body>
</html>