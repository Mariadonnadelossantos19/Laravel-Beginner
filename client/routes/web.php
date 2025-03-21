<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/comment', function () {
    return view('comment');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/send-comment', [CommentController::class, 'store'])->name('comments.store');
    Route::get('/get-comments/{id}/{cpID}/{cpType}', [CommentController::class, 'show'])->name('comments.show');
    Route::post('/send-reply', [CommentController::class, 'storeReply']);
    Route::get('/get-replies/{id}', [CommentController::class, 'showReplies']);
    Route::get('/count-replies-attachments/{id}/{cpID}/{cpType}', [CommentController::class, 'countRepliesAndAttachments']);
    Route::get('/open-comment/{id}/{cpID}/{cpType}', [CommentController::class, 'openComment']);
    Route::get('/delete-reply/{id}', [CommentController::class, 'deleteReply']);
    Route::get('/delete-comment/{id}', [CommentController::class, 'deleteComment']);
    Route::get('/archive-comment/{id}', [CommentController::class, 'archiveComment']);
    Route::get('/get-latest-comment/{id}/{cpID}/{cpType}', [CommentController::class, 'getLatestComment']);
    Route::get('/count-comments/{id}/{cpID}/{cpType}', [CommentController::class, 'countComments']);
    Route::post('/update-comment-reply', [CommentController::class, 'updateCommentReply']);
});

// User Authentication Routes
Route::get('/register', [UserController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [UserController::class, 'register']);
Route::get('/login', [UserController::class, 'showLoginForm'])->name('login');
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->name('logout');
Route::get('/profile', [UserController::class, 'profile'])->middleware('auth')->name('profile');
