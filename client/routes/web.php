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
//api para dun sa nasa views. 
Route::get('/contactus',[PageController::class, 'contactus']);
Route::get('/aboutus', [PageController::class, 'aboutus']);

Route::get('/employee', function () {

    $age=22;
    $grade = 75;
    $employee =array (
        array('name' => 'Juan Dela Cruz', 'age' => 25, 'dept' => 'IT'),
        array('name' => 'Pedro Penduko', 'age' => 22, 'dept' => 'HR'),
        array('name' => 'Juan Tamad', 'age' => 30, 'dept' => 'IT'),
    )
    ;
    return view ('employee')
    ->with('employee', $employee)
    ->with('grade', $grade);
    -with('age',$age);
});
    
    //return view('employee', ['employee' => $employee]);
    //return response()->json($employee);
