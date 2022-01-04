<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::post('/register', [UserController::class,'register']);
Route::post('/login', [UserController::class,'authenticate']);
Route::get('/logout', [UserController::class,'logout']);

Route::get('/', function () {
    return response()->json([
        'hello' => 'access specific routes to get specific data'
    ]);
});

Route::get('/error', function () {
    return response()->json([
        'error'=>true,
        'message'=>'You are not allowed to view the page. Please provide valid credentials'
    ],401);
})->name('error');
