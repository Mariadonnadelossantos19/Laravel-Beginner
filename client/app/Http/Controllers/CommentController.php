<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

use app\Models\Comments;
use App\Models\UserLogs;
use Dotenv\Util\Str;
use Exception;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'comment' => 'required|string',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Create a new comment
        $comment = new Comments();
        $comment->cmt_content = $request->input('comment');

        // Handle file upload if present
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads'), $filename);
            $comment->cmt_attachment = $filename;
        }

        $comment->cmt_added_by = auth()->id(); // Assuming user is authenticated
        $comment->cmt_dt_added = now();
        $comment->save();

        return response()->json(['success' => true, 'message' => 'Comment added successfully!']);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id, string $cpID, string $cpType)
    {
        try {
            $comments = Comments::where('cmt_cp_id', $id)
                ->where('cmt_cp_type', $cpType)
                ->get();

            return response()->json(['comments' => $comments]);
        } catch (Exception $e) {
            return response()->json(['error' => 'Unable to fetch comments.'], 500);
        }
    }

    public function countComments(int $id, string $cpID, string $cpType)
    {
        try{
            $results = Comments::where('cmt_cp_id', $id)
            ->where('cmt_concept_id', $cpID)
            ->where('cmt_cp_type', $cpType)->count();
    
            return response()->json(['success' => true, 'output' => $results], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getComments(int $id, string $cpID, string $cpType){
        $results = Comments::where('cmt_cp_id', $id)
        ->where('cmt_concept_id', $cpID)
        ->where('cmt_cp_type', $cpType)->count();

        return $results;
    }



    /**
     * Display the specified resource.
     */
    public function showReplies(int $id)
    {
        try{
            $results = Comments::select('*', 
            DB::raw("CASE 
            WHEN cmt_added_by = " . auth()->user()->id . " THEN 'true'
            ELSE 'false'
            END AS added_by_logged_in_user"))
            ->leftJoin('users', 'cmt_added_by', '=', 'id')
            ->join('tbluser_types', 'usr_type', '=', 'utype_id')
            ->where('cmt_isReply_to', $id)
            ->orderBy('cmt_dt_added', 'ASC')
            ->get();
    
            
            $replies = Comments::where('cmt_isReply_to', $id)->count();  
            $attachments = Comments::where('cmt_attachment', '!=', NUll)->where('cmt_isReply_to', $id)->count();
            
    
            return response()->json(['success' => true, 'output' => $results, 'replies' => $replies, 'attachments' => $attachments], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function countReplies(int $id){
        return Comments::where('cmt_isReply_to', $id)->count();  
    }

    public function countRepliesAndAttachments(int $id, string $cpID, string $cpType){
        try{
            $replies = Comments::where('cmt_isReply_to', $id)->count();  
            $attachments = Comments::where('cmt_attachment', '!=', NUll)->where('cmt_isReply_to', $id)->count();
            $users = Comments::select('usr_image')
            ->join('users', 'cmt_added_by', '=', 'id')
            ->where('cmt_isReply_to', $id)
            ->where('cmt_concept_id', $cpID)
            ->where('cmt_cp_type', $cpType)
            ->groupBy('cmt_added_by')
            ->get(); 
            return response()->json(['success' => true, 'replies' => $replies, 'attachments' => $attachments, 'users' => $users], 200);  
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function openComment(int $id, string $cpID, string $cpType){

        try{
            Comments::where('cmt_cp_id', $id)
            ->where('cmt_concept_id', $cpID)
            ->where('cmt_cp_type', $cpType)
            ->update([
                'cmt_isOpened' => 1,
            ]);
            return response(['success' => true], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteReply(int $id, UserLogsController $log){
        try{
            $content = Comments::where('cmt_id', $id)->first('cmt_content')->cmt_content;
    
            try{
                $file = Comments::where('cmt_id', $id)->first('cmt_attachment')->cmt_attachment;
                if($file){
                    Storage::disk('comments')->delete($file);
                }
            }catch(Exception $e){
    
            }
    
            Comments::where('cmt_id', $id)->delete();
    
            $action = "Deleted reply: " . $content;
            $log->save_logs($action, "Comments");
    
            return response()->json(['success' => true], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteComment(int $id, UserLogsController $log){
        try{
            
            // delete replies in the comment
            Comments::where('cmt_isReply_to', $id)->delete();
            
            $content = Comments::where('cmt_id', $id)->first('cmt_content')->cmt_content;
    
            try{
                $file = Comments::where('cmt_id', $id)->first('cmt_attachment')->cmt_attachment;
                if($file){
                    Storage::disk('comments')->delete($file);
                }
            }catch(Exception $e){
    
            }
    
            Comments::where('cmt_id', $id)->delete();

    
            $action = "Deleted reply: " . $content;
            $log->save_logs($action, "Comments");
    
            return response()->json(['success' => true], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function archiveComment(int $id, UserLogsController $log){
        $content = Comments::where('cmt_id', $id)->first('cmt_content')->cmt_content;
        Comments::where('cmt_id', $id)->update(['cmt_isArchived' => 1]);

        $action = "Archived comment: " . $content;
        $log->save_logs($action, "Comments");

        return response()->json(['success' => true]);
    }

    public function editReply(int $id){
        try{
            $result = Comments::where('cmt_id', $id)->get();
            foreach($result as $row){
                $content = $row['cmt_content'];
                $attachment = $row['cmt_attachment'];
                $original = $row['cmt_original_file_name'];
            }
    
            return response()->json(['success' => true, 'content' => $content, 'attachment' => $attachment, 'original' => $original], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

     /**
     * Store a newly created resource in storage.
     */
    public function storeReply(Request $request)
    {
        try{
            $data = [
                'cmt_cp_id' => $request->id,
                'cmt_content' => $request->reply,
                'cmt_added_by' => auth()->user()->id,
                'cmt_dt_added' => now(),
                'cmt_isReply_to' => $request->replyTo,
                'cmt_concept_id' => $request->conceptID,
                'cmt_cp_type' => $request->conceptType,
            ];

            if ($request->file('file')) {
                $originalFileName = $request->file('file'); 
                $file = $request->file('file')->store(options: 'comments');
                $data['cmt_attachment'] = $file;
                $data['cmt_original_file_name'] = $originalFileName->getClientOriginalName();
            }

            Comments::create($data);

            return response()->json(['success' => true], 200);
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getLatestComment(int $rowID, string $conceptID, string $type){

        try {
            $latestComment = Comments::selectRaw('cmt_id, cmt_content, 
            cmt_dt_added,  
            cmt_isOpened,
            cmt_isReply_to,
            usr_image, CONCAT(first_name, " ", last_name) as commenter')
            ->join('users', 'cmt_added_by', '=', 'id')
            ->where('cmt_cp_type', $type)
            ->where('cmt_cp_id', $rowID)
            ->where('cmt_concept_id', $conceptID)
            ->orderBy('cmt_id', 'desc')
            ->limit(1)
            ->get();
    
            return response()->json(['success' => true, 'output' => $latestComment], 200);
        }catch (\Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateCommentReply(Request $request){
        try{
            $data = [
                'cmt_content' => $request->content,
            ];

            if($request->removeClip == 'true'){
                $file = Comments::where('cmt_id', $request->id)->first('cmt_attachment')->cmt_attachment;
                Storage::disk('comments')->delete($file);
                $data['cmt_attachment'] = null;
                $data['cmt_original_file_name'] = null;
            }

            if ($request->file('file')) {

                $file = Comments::where('cmt_id', $request->id)->first('cmt_attachment')->cmt_attachment;

                if($file){
                    Storage::disk('comments')->delete($file);
                }

                $originalFileName = $request->file('file'); 
                $file = $request->file('file')->store(options: 'comments');
                $data['cmt_attachment'] = $file;
                $data['cmt_original_file_name'] = $originalFileName->getClientOriginalName();
                $outputFile = $file;
                $outputOriginal = $originalFileName->getClientOriginalName();
            }else{
                $outputFile = null;
                $outputOriginal = null;
            }
    
            Comments::where('cmt_id', $request->id)
            ->update($data);
     

            return response()->json(['success' => 'true', 'file' => $outputFile], 200);   
        }catch(Exception $e){
            return response()->json(['error' => $e->getMessage()], 500);
        }
  

         
    }
}
