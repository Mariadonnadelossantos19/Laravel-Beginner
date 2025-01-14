<?php

use Illuminate\Support\Facades\Route;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;
use App\Http\Controllers\PageController;

Route::get('/', function () {
    return view('welcome');
});



/*Route::get('greet/{name?}', function ($name ="Lucille") {
    return 'Welcome to the world of Laravel'.$name;


});

Route::get('/admin/dashboard', function () {
    return "dashboard";


});
Route::get('/admin/profile', function () {
    return "profile";


});
Route::group(['prefix' => 'admin'], function(){
    Route::get ('dashboard', function(){
        return "dashboard";
    });
});

Route::get('contactus', [PageController::class, 'contactus']);
Route::get('aboutus', [PageController::class, 'Aboutus']);
*/

Route::get('/contactus',[PageController::class, 'contactus']);
Route::get('/aboutus', [PageController::class, 'aboutus']);

Route::get('/employee', function () {
    $employee = [
        "name" => "Madonna",
        'age' => 22,
        "department" => "IT"
    ];
    return view('employee', ['employee' => $employee]);
    //return response()->json($employee);
});