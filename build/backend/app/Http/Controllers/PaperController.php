<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Paper;
use App\Models\User;
use App\Models\Withdraw;
use App\Models\NominatedReviewer;
use App\Models\Assigned;
use App\Models\Withdrawl;
use App\Models\EvaluationMetric;
use App\Models\Metric;
use App\Models\Evaluation;

class PaperController extends Controller
{

    public function submitReview(Request $request, $id) {

        $paper = Paper::find($id);        

        if (!$paper) {
            return response()->json([
                'error' => true,
                'message' => 'Paper with id ' . $id . ' not found'
            ], 404);
        }

        $assigned = Assigned::where('paper_id', $id)
                    ->where('reviewer_email',$request->user()->email)->first();

        if (!$assigned)
            return response()->json([
                'error' => true,
                'message' => 'Paper not assigned to you'
            ],401);

        $request->validate([
            'answer' => 'required|string',
            'question_id' => 'required|exists:metrics,id'
        ]);

        $metric = Metric::find($request->question_id);

        if ( !$metric ) 
            return response()->json([
                'error' => true,
                'message' => 'Not well set up :/'
            ],422);


        $evaluation = Evaluation::where('metric_id',$metric->id)
                                ->where('reviewer_email',$request->user()->email)
                                ->where('paper_id', $id)
                                ->first();
        
        if (!$evaluation)
            $evaluation = new Evaluation;

        $evaluation->answer = $request->answer;
        $evaluation->metric_id = $metric->id;
        $evaluation->reviewer_email = $request->user()->email;
        $evaluation->paper_id = $id;
        $evaluation->status = 'pending';
        $evaluation->editor_comments = "";
        $evaluation->additional_comments = "";
        $evaluation->save();

        return response()->json([
            'evaluation' => $evaluation,
        ]);
        
    }

    public function getPaperById(Request $request, $id)
    {

        $paper = Paper::find($id);        

        if (!$paper) {
            return response()->json([
                'error' => true,
                'message' => 'Paper with id ' . $id . ' not found'
            ], 404);
        }

        $withdrawl = Withdrawl::where('paper_id','=',$id)->first();        

        if ($paper->status !== 'published') {
            if ($request->user()->type == 'editor') {
                if ($paper->editor_email != $request->user()->email)
                    return response()->json([
                        'error' => true,
                        'message' => 'You are not alloweed to view this section'
                    ], 401);
            } else if ($request->user()->type == 'researcher') {
                if ($paper->researcher_email != $request->user()->email) {
                    return response()->json([
                        'error' => true,
                        'message' => 'You are not alloweed to view this section'
                    ], 401);
                }
            } else if ($request->user()->type != 'admin')
                return response()->json([
                    'error' => true,
                    'message' => 'You are not allowed to view this section'
                ]);
        }


        $nominated = NominatedReviewer::where('paper_id', $id)
            ->join('users', 'users.email', 'nominated_reviewers.reviewer_email')
            ->selectRaw('CONCAT(first_name, CONCAT(" ", last_name)) as reviewer, users.id as reviewer_id, reviewer_email')->get();

        $assigned = Assigned::where('paper_id', $id)
            ->join('users', 'users.email', 'assigneds.reviewer_email')
            ->selectRaw('CONCAT(first_name, CONCAT(" ", last_name)) as reviewer, users.id as reviewer_id, reviewer_email')->get();

        $researcher = User::where('email', $paper->researcher_email)->first();
        

        if (!$researcher )
            return response()->json([
                'error' => true,
                'message' => 'This paper is wild and free, not meant for you'
            ], 422);
        
        $editor = User::where('email', $paper->editor_email)->first();
        $evaluation_metric = EvaluationMetric::where('name', $paper->em_name)->first();

        if ( ! $evaluation_metric && $editor)  {
            return response()->json([
                'success' => true,
                'paper' =>  array(
                    'id' => $paper->id,
                    'title' => $paper->title,
                    'status' => $paper->status,
                    'file_path' => $paper->file_path,
                    'researcher' => $researcher->first_name . " " . $researcher->last_name,
                    'researcher_id' => $researcher->id,
                    'editor' => $editor->first_name . " " . $editor->last_name,
                    'editor_id' => $editor->id,
                    'editor_email' => $editor->email,
                    'researcher_email' => $researcher->email,
                ),
                'nominated' => $nominated,
                'assigned' => $assigned,
                'withdraw' => $withdrawl ? $withdrawl->status : false,              
            ]);
        } else if ( !$editor ) {
            return response()->json([
                'success' => true,
                'paper' =>  array(
                    'id' => $paper->id,
                    'title' => $paper->title,
                    'status' => $paper->status,
                    'file_path' => $paper->file_path,
                    'researcher' => $researcher->first_name . " " . $researcher->last_name,
                    'researcher_id' => $researcher->id,
                    'researcher_email' => $researcher->email,
                ),
                'nominated' => $nominated,
                'assigned' => $assigned,
                'withdraw' => $withdrawl ? $withdrawl->status : false,              
            ]);
        }

        $metrics = Metric::where('em_id',$evaluation_metric->id)->get();
        $evaluations = Evaluation::where('paper_id',$id)
                        ->join('users', 'users.email','evaluations.reviewer_email')
                        ->selectRaw('evaluations.id as id, answer, metric_id, reviewer_email, evaluations.status,
                        editor_comments, additional_comments, CONCAT(first_name,CONCAT(" ", last_name)) as reviewer');

        $evaluations = Metric::joinSub($evaluations,'evaluations', function ($join){
            $join->on('evaluations.metric_id','=','metrics.id');
        })
        ->selectRaw('evaluations.id as id, answer, metric_id, question, answer_type, reviewer_email, evaluations.status,
        editor_comments, additional_comments, reviewer')
        ->get();

        return response()->json([
            'success' => true,
            'paper' =>  array(
                'id' => $paper->id,
                'title' => $paper->title,
                'status' => $paper->status,
                'file_path' => $paper->file_path,
                'researcher' => $researcher->first_name . " " . $researcher->last_name,
                'researcher_id' => $researcher->id,
                'editor' => $editor->first_name . " " . $editor->last_name,
                'editor_id' => $editor->id,
                'editor_email' => $editor->email,
                'researcher_email' => $researcher->email,
            ),
            'nominated' => $nominated,
            'assigned' => $assigned,
            'withdraw' => $withdrawl ? $withdrawl->status : false,
            'evaluation_metric' => array(
                'name' => $evaluation_metric->name,
                'questions' => $metrics
            ),
            'reviews' => $evaluations
        ]);
    }

    public function getAllPapersByResearcher(Request $request, $id)
    {
        if ($request->user()->type == 'editor' || $request->user()->type == 'researcher') {
            $researcher = User::find($id);
            if (!$researcher) {
                return response()->json([
                    'error' => true,
                    'message' => 'User not found'
                ], 404);
            }

            $papers = Paper::where('researcher_email', $researcher->email);
            $papers = User::joinSub($papers, 'papers', function ($join) {
                $join->on('users.email', '=', 'papers.researcher_email');
            })
                ->selectRaw('papers.id as id, researcher_email, papers.status, editor_email, file_path, title,
                        CONCAT(first_name,CONCAT(" ",last_name)) as researcher, users.id as researcher_id');
            $papers = User::joinSub($papers, 'papers', function ($join) {
                $join->on('users.email', '=', 'papers.editor_email');
            })
                ->selectRaw('papers.id as id, researcher_email, papers.status, editor_email, file_path, 
                        researcher_id, researcher, title,
                        CONCAT(first_name,CONCAT(" ",last_name)) as editor, users.id as editor_id')
                ->get();

            return response()->json([
                'papers' => $papers
            ]);
        }

        return response()->json([
            'error' => true,
            'message' => 'You are not allowed to view this section'
        ], 401);
    }

    public function uploadPaper(Request $request)
    {
        if ($request->user()->type == 'researcher') {

            $request->validate([
                'title' => 'required|string',
                'file' => 'required|file',
            ]);

            $extension = $request->file->extension();
            if ($extension != 'pdf')
                return response()->json([
                    'error' => true,
                    'message' => 'Only pdfs allowed',
                    'given' => $extension
                ], 401);

            $paper = new Paper;

            $paper->title = $request->title;
            $path = str_replace('public/', '', $request->file->store('public'));
            $paper->file_path = $path;
            $paper->researcher_email = $request->user()->email;
            $paper->status = 'pending_assignment';
            $paper->editor_email = 'editor@mail.com';
            $paper->save();

            
            $researcher = User::where('email', $paper->researcher_email)->first();

            if ( !$researcher )
                return response()->json([
                    'error' => true,
                    'message' => 'This paper is wild and free, not meant for you'
                ], 422);

            return response()->json([
                'success' => true,
                'paper' => array(
                    'id' => $paper->id,
                    'title' => $paper->title,
                    'status' => $paper->status,
                    'file_path' => $paper->file_path,
                    'researcher' => $researcher->first_name . " " . $researcher->last_name,
                    'researcher_id' => $researcher->id,
                    'researcher_email' => $researcher->email
                )
            ]);
        }

        return response()->json([
            'error' => true,
            'message' => 'You are not alloweed to view this section'
        ], 401);
    }

    public function getPaperStatus(Request $request, $id)
    {

        if ($request->user()->type != 'admin' && $request->user()->type != 'editor')
            return response()->json([
                'error' => true,
                'message' => 'You are not allowed to view this section'
            ], 401);

        $paper = Paper::find($id);

        if (!$paper)
            return response()->json([
                'error' => true,
                'message' => 'Paper with id ' . $id . 'does not exist'
            ]);

        return response()->json([
            'success' => true,
            'status' => $paper->status
        ]);
    }

    public function getPapersWithdrawn(Request $request)
    {
        if ($request->user()->type != 'admin') {
            return response()->json([
                'error' => true,
                'message' => 'You are not alloweed to view this section'
            ], 401);
        }

        $papers = Paper::join('withdrawls','withdrawls.paper_id','papers.id')->select('papers.*','withdrawls.status as withdrawal_status');
        $papers = User::joinSub($papers, 'papers', function ($join) {
            $join->on('users.email', '=', 'papers.researcher_email');
        })
            ->selectRaw('papers.id as id, researcher_email, papers.status, editor_email, file_path, withdrawal_status, title,
                    CONCAT(first_name,CONCAT(" ",last_name)) as researcher, users.id as researcher_id');
        $papers = User::joinSub($papers, 'papers', function ($join) {
            $join->on('users.email', '=', 'papers.editor_email');
        })
            ->selectRaw('papers.id as id, researcher_email, papers.status, editor_email, file_path, withdrawal_status, title,
                    researcher_id, researcher,
                    CONCAT(first_name,CONCAT(" ",last_name)) as editor, users.id as editor_id')
            ->get();

        return response()->json([
            'papers' => $papers
        ]);
    }

    public function withdrawPaper(Request $request, $id)
    {
        if ($request->user()->type != 'admin') {
            return response()->json([
                'error' => true,
                'message' => 'You are not alloweed to view this section'
            ], 401);
        }
        
        $paper = Paper::find($id);

        if (!$paper)
            return response()->json([
                'error' => true,
                'message' => 'Paper not found'
            ]);

        $withdrawl = Withdrawl::where('paper_id',$id)->first();

        if (!$withdrawl)
            return response()->json([
                'error' => true,
                'message' => 'Paper withrawls not requested'
            ]);

        $request->validate([
            'approved' => 'boolean'
        ]);

        if ($request->has('approved') && $request->approved == false) {
            $withdrawl->status = 'rejected';
            $withdrawl->save();
        } else {
            $paper->delete();
        }
        

        return response()->json([
            'success' => true,
        ]);
    }

    public function requestWithdrawPaper(Request $request, $id)
    {
        if ($request->user()->type != 'researcher')
            return response()->json([
                'error' => true,
                'message' => 'you do not have permission to perform that action'
            ], 401);

        $paper = Paper::find($id);

        if (!$paper)
            return response()->json([
                'error' => true,
                'message' => 'Paper with id of ' . $id . ' does not exist'
            ], 404);

        if ($paper->researcher_email != $request->user()->email)
            return response()->json([
                'error' => true,
                'message' => 'You do not own this paper'
            ], 401);

        $withdrawl = Withdrawl::where('paper_id',$id)->first();

        if ($withdrawl)
            $withdrawl->delete();
        else {
            $withdrawl = new Withdrawl;
            $withdrawl->paper_id = $id;
            $withdrawl->status = 'awaiting';
            $withdrawl->save();           
        }     

        return response()->json([
            'success' => true,
        ]);
    }

    public function editPaper(Request $request, $id)
    {
        if ($request->user()->type == 'editor') {
            $paper = Paper::find($id);

            if (!$paper)
                return response()->json([
                    'error' => true,
                    'message' => 'paper with id ' . $id . ' does not exist'
                ],404);

            $request->validate([
                'title' => 'string',
                'status' => 'in:pending_revision,pending_publication,pending_assignment,published'
            ]);

            if ($request->has('title'))
                $paper->title = $request->title;
            if ($request->has('status'))
                $paper->status = $request->status;

            $paper->save();

            return response()->json([
                'success' => true,
            ]);
        } else if ($request->user()->type == 'researcher' ) {

            $paper = Paper::find($id);

            if (!$paper)
                return response()->json([
                    'error' => true,
                    'message' => 'paper with id ' . $id . ' does not exist'
                ],404);

            $request->validate([
                'title' => 'string',
                'file' => 'file',
            ]);



            if ($request->has('title'))
                $paper->title = $request->title;

            $path = null;
            if ($request->hasFile('file')) {

                $extension = $request->file->extension();
                if ($extension != 'pdf')
                    return response()->json([
                        'error' => true,
                        'message' => 'Only pdfs allowed',
                        'given' => $extension
                    ], 401);

                $path = str_replace('public/', '', $request->file->store('public'));
                $paper->file_path = $path;
            }

            $paper->save();

            return response()->json([
                'success' => true,
                'new_file_path' => $path
            ]);
        }

        return response()->json([
            'error' => true,
            'message' => 'You are not alloweed to view this section'
        ], 401);
    }

    public function getAllPapers(Request $request)
    {
        if ($request->user()->type == 'admin') {
            $papers = Paper::select('*');
        } else if ($request->user()->type == 'editor') {
            $papers = Paper::where('editor_email', $request->user()->email)
                ->orWhere('status', 'approved');
        } else if ($request->user()->type == 'researcher') {
            $papers = Paper::where('researcher_email', $request->user()->email)
                ->orWhere('status', 'approved');
        } else if ($request->user()->type == 'reviewer') {
            $papers = Assigned::join('papers','papers.id','assigneds.paper_id')
                ->where('reviewer_email', $request->user()->email) 
                ->select('papers.*','assigneds.revision_deadline');  

            $papers = User::joinSub($papers, 'papers', function ($join) {
                $join->on('users.email', '=', 'papers.researcher_email');
            })
                ->selectRaw('papers.id as id, title, researcher_email, papers.status, editor_email, file_path, 
                revision_deadline, CONCAT(first_name,CONCAT(" ",last_name)) as researcher, users.id as researcher_id');

            $papers = User::joinSub($papers, 'papers', function ($join) {
                $join->on('users.email', '=', 'papers.editor_email');
            })
                ->selectRaw('papers.id as id, title, researcher_email, papers.status, editor_email, file_path, 
                        researcher_id, researcher, revision_deadline,
                        CONCAT(first_name,CONCAT(" ",last_name)) as editor, users.id as editor_id')
                ->get();
    
            return response()->json([
                'success' => true,
                'papers' => $papers
            ]);
        } else {
            $papers = Paper::where('status', 'published');
        }

        $papers = User::joinSub($papers, 'papers', function ($join) {
            $join->on('users.email', '=', 'papers.researcher_email');
        })
            ->selectRaw('papers.id as id, title, researcher_email, papers.status, editor_email, file_path, 
                    CONCAT(first_name,CONCAT(" ",last_name)) as researcher, users.id as researcher_id');
        
        $papers = User::joinSub($papers, 'papers', function ($join) {
            $join->on('users.email', '=', 'papers.editor_email');
        })
            ->selectRaw('papers.id as id, title, researcher_email, papers.status, editor_email, file_path, 
                    researcher_id, researcher,
                    CONCAT(first_name,CONCAT(" ",last_name)) as editor, users.id as editor_id')
            ->get();

        return response()->json([
            'success' => true,
            'papers' => $papers
        ]);
    }
}
