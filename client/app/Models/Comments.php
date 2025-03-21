<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comments extends Model
{
    use HasFactory;

    protected $table = 'tblcomments';
    protected $primaryKey = 'cmt_id';
    public $timestamps = false; // Set to true if using Laravel timestamps

    protected $fillable = [
        'cmt_cp_id',
        'cmt_content',
        'cmt_attachment',
        'cmt_added_by',
        'cmt_dt_added',
        'cmt_dt_updated',
        'cmt_isReply_to',
        'cmt_isOpened',
        'cmt_original_file_name',
        'cmt_concept_id',
        'cmt_cp_type',
    ];

    // Define custom timestamps if needed
    const CREATED_AT = 'cmt_dt_added';
    const UPDATED_AT = 'cmt_dt_updated';
}