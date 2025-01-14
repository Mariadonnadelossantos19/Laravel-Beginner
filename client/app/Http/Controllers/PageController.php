<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    public function contactus(){
        return view('contactus');
    }

    public function aboutus(){
        return view('aboutus');
    }
    

   /* public function aboutus(){
        return "This is the page of Aboutus page!";
    }*/
}
