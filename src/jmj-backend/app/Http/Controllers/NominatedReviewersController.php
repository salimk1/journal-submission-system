<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NominatedReviewer;
use App\Models\Paper;
use App\Models\User;

class NominatedReviewersController extends Controller
{
    public function nominateForPaper(Request $request) {
        
        if ( $request->user()->type != 'researcher') {
            return response()->json([
                'error' => true,
                'message' =>'You do not have the authority to perform this action'
            ],401);
        }

        $request->validate([
            'paper_id' => 'required|exists:papers,id',
            'reviewer_email' => 'required|exists:users,email'
        ]);

        $paper = Paper::find($request->paper_id);

        if (!$paper) {
            return response()->json([
                'error' => true,
                'message' => 'Paper with id ' . $request->paper_id . ' does not exist'
            ],404);
        }

        $reviewer = User::where('email',$request->reviewer_email)->first();

        if (!$reviewer) {
            return response()->json([
                'error' => true,
                'message' => 'Reviewer with id ' . $request->reviewer_email . ' does not exist'
            ],404);
        }

        if ( $paper->researcher_email != $request->user()->email ) {
            return response()->json([
                'error' => true,
                'message' =>'You do not have the authority to perform this action'
            ],401);
        }

        $nomiated = new NominatedReviewer;
        $nomiated->paper_id = $paper->id;        
        $nomiated->reviewer_email = $reviewer->email;
        $nomiated->researcher_email = $request->user()->email;
        $nomiated->save();

        return response()->json([
            'success' => true,  
            'nominated' => array(
                'reviewer' => $reviewer->first_name . ' ' . $reviewer->last_name,
                'reviewer_email' => $reviewer->email,
                'reviewer_id' => $reviewer->id
            )
        ]);
    }

    public function removeNominee (Request $request) {

        if ( $request->user()->type != 'researcher' && $request->user()->type != 'editor') {
            return response()->json([
                'error' => true,
                'message' =>'You do not have the authority to perform this action'
            ],401);
        }

        $request->validate([
            'paper_id' => 'required|exists:papers,id',
            'reviewer_email' => 'required|exists:users,email'
        ]);

        $paper = Paper::find($request->paper_id);

        if (!$paper) {
            return response()->json([
                'error' => true,
                'message' => 'Paper with id ' . $request->paper_id . ' does not exist'
            ],404);
        }

        $reviewer = User::where('email',$request->reviewer_email)->first();

        if (!$reviewer) {
            return response()->json([
                'error' => true,
                'message' => 'Reviewer with id ' . $request->reviewer_email . ' does not exist'
            ],404);
        }

        if ( $paper->researcher_email != $request->user()->email && $paper->editor_email != $request->user()->email) {
            return response()->json([
                'error' => true,
                'message' =>'You do not have the authority to perform this action'
            ],401);
        }

        $nomiated = NominatedReviewer::where('paper_id',$request->paper_id)
                                    ->where('reviewer_email',$request->reviewer_email)->first();
        
        if ($nomiated)                                    
            $nomiated->delete();

        return response()->json([
            'success' => true,            
        ]);

    }
}
