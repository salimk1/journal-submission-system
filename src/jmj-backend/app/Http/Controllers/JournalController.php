<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Journal;
use App\Models\Paper;
use App\Models\PaperJournal;
use App\Models\User;

class JournalController extends Controller
{
    public function createJournal(Request $request)
    {
        // check user is editor
        if ($request->user()->type == 'editor') {

            // validate user is an editor or admin
            $validated = $request->validate([
                'title' => 'required',
                'published_date' => 'required|date_format:Y-m-d',
            ]);

            // add to journal
            $Journal = new Journal;
            $Journal->title = $request->title;
            $Journal->published_date = $request->published_date;
            $Journal->status = 'pending';    // status
            $Journal->editor_email = $request->user()->email;
            // timstamp autogen
            $Journal->admin_email = 'admin@mail.com'; //$request->user()->admin_email;  // admin_email
            $Journal->save();

            return response()->json([
                'success' => true,
                'journal' => $Journal
            ]);
        } elseif ($request->user()->type == 'admin') {

            // validate user is an editor or admin
            $validated = $request->validate([
                'title' => 'required',
                'published_date' => 'required|date_format:Y-m-d',
                'status' => 'required|in:pending,approved,rejected',
                'admin_email' => 'required|email|exists:users,email',
                'editor_email' => 'required|email|exists:users,email',
            ]);

            // add to journal
            $Journal = new Journal;
            $Journal->title = $request->title;
            $Journal->published_date = $request->published_date;
            $Journal->status = $request->status;
            $Journal->editor_email = $request->editor_email;
            // timstamp autogen
            $Journal->admin_email = $request->admin_email; //$request->user()->admin_email;  // admin_email
            $Journal->save();

            return response()->json([
                'success' => true,
                'journal' => $Journal
            ]);
        } else
            // return error message
            return response()->json([
                'error' => true,      // key
                'message' => 'only an editor or an admin can access this',
            ], 401);
    }

    public function getAllJournals(Request $request)
    {


        if ($request->user()->type == 'editor') {

            $journals = Journal::join('users', 'journals.admin_email', 'users.email')
                ->where('editor_email', $request->user()->email)
                ->selectRaw('title, published_date,journals.status as status,
                                users.id as admin_id, journals.admin_email, journals.id as id,
                                CONCAT(first_name,CONCAT(" ", last_name)) as admin ,editor_email');

            $journals = User::joinSub($journals, 'journals', function ($join) {
                $join->on('users.email', '=', 'journals.editor_email');
            })->selectRaw('title, published_date,journals.status as status, journals.id as id, journals.admin_email, editor_email, admin_id,
            admin , CONCAT(first_name,CONCAT(" ", last_name)) as editor, users.id as editor_id')
                ->get();


            return response()->json([
                'success' => true,
                'journals' => $journals
            ]);
        } elseif ($request->user()->type == 'admin') {

            $journals = Journal::join('users', 'journals.admin_email', 'users.email')
                ->selectRaw('journals.id, title, published_date,journals.status as status,
                                users.id as admin_id, journals.admin_email,
                                CONCAT(first_name,CONCAT(" ", last_name)) as admin ,editor_email');

            $journals = User::joinSub($journals, 'journals', function ($join) {
                $join->on('users.email', '=', 'journals.editor_email');
            })->selectRaw('journals.id, title, published_date,journals.status as status, admin_id,
            editor_email, journals.admin_email,
            admin , CONCAT(first_name,CONCAT(" ", last_name)) as editor, users.id as editor_id')
                ->get();


            return response()->json([
                'success' => true,
                'journals' => $journals
            ]);
        }
        return response()->json([
            'success' => true,
            'journals' => Journal::where('status', 'approved')->get(),
        ]);
    }

    public function getJournalById(Request $request, $id)
    {
        $journal = Journal::find($id);

        if (!$journal)
            return response()->json([
                'error' => true,
                'message' => 'Could not find Journal with id of ' . $id
            ], 404);

        if ($request->user()->type != 'admin' && $request->user()->type != 'editor') {
            if ($journal->status != 'approved')
                return response()->json([
                    'error' => true,
                    'message' => 'You are not allowed to view this section'
                ], 401);
        }

        $papers = PaperJournal::join('papers', 'paper_journals.paper_id', 'papers.id')
            ->select('title', 'papers.id as id', 'editor_email', 'file_path', 'researcher_email', 'em_name', 'papers.status')
            ->where('journal_id', $journal->id);

        $papers = User::joinSub($papers, 'papers', function ($join) {
            $join->on('papers.editor_email', '=', 'users.email');
        })
            ->selectRaw('title, papers.id as id, file_path, researcher_email, editor_email, em_name, papers.status,
                    users.id as editor_id, CONCAT(first_name, CONCAT(" ", last_name)) as editor');

        $papers = User::joinSub($papers, 'papers', function ($join) {
            $join->on('papers.researcher_email', '=', 'users.email');
        })
            ->selectRaw('title, papers.id as id, file_path, researcher_email, em_name, papers.status,
                    editor, editor_id, editor_email,
                    users.id as researcher_id, CONCAT(first_name, CONCAT(" ", last_name)) as researcher')
            ->get();

        $editor = User::where('email', $journal->editor_email)->first();
        $admin = User::where('email', $journal->admin_email)->first();

        return response()->json([
            'journal' => [
                'title' => $journal->title,
                'published_date' => $journal->published_date,
                'status' => $journal->status,
                'admin_email' => $journal->admin_email,
                'editor_email' => $journal->editor_email,
                'editor' => $editor->first_name . " " . $editor->last_name,
                'admin' => $admin->first_name . " " . $admin->last_name,
                'papers' => $papers
            ]
        ]);
    }

    public function changeStatusJournal(Request $request, $id)
    {

        if ($request->user()->type != 'admin')
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);


        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $journal = Journal::find($id);

        if (!$journal)
            return response()->json([
                'error' => true,
                'message' => 'Journal of id ' . $id . 'not found'
            ], 404);

        $journal->status = $request->status;
        $journal->save();

        return response()->json([
            'success' => true,
        ]);
    }

    public function editJournal(Request $request, $id)
    {

        if ($request->user()->type != 'admin' && $request->user()->type != 'editor')
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);

        $journal = Journal::find($id);
        if (!$journal)
            return response()->json([
                'error' => true,
                'message' => 'Journal of id ' . $id . 'not found'
            ], 404);

        $request->validate([
            'title' => 'string',
            'published_date' => 'date_format:Y-m-d',
            'status' => 'in:pending,approved,rejected',
            'admin_email' => 'email|exists:users,email',
            'editor_email' => 'email|exists:users,email',
        ]);


        if ($request->has('title'))
            $journal->title = $request->title;

        if ($request->has('published_date'))
            $journal->published_date = $request->published_date;

        if ($request->has('status'))
            $journal->status = $request->status;

        if ($request->has('admin_email'))
            $journal->admin_email = $request->admin_email;

        if ($request->has('editor_email'))
            $journal->editor_email = $request->editor_email;

        $journal->save();

        return response()->json([
            'success' => true
        ]);
    }

    public function removeJournal(Request $request, $id)
    {
        if ($request->user()->type != 'admin')
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);

        $journal = Journal::find($id);

        if (!$journal)
            return response()->json([
                'error' => true,
                'message' => 'Journal of id ' . $id . 'not found'
            ], 404);

        $journal->delete();

        return response()->json([
            'success' => true
        ]);
    }


    public function addPaperToJournal(Request $request, $id)
    {
        if ($request->user()->type != 'admin' && $request->user()->type != 'editor')
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);

        $request->validate([
            'paper_id' => 'required|integer|exists:papers,id',
        ]);

        $journal = Journal::find($id);
        $paper = Paper::find($request->paper_id);

        if (!$journal)
            return response()->json([
                'error' => true,
                'message' => 'Journal of id ' . $id . 'not found'
            ], 404);

        if ($request->user() == 'editor') {
            if (
                $journal->editor_email != $request->user()->email ||
                $paper->editor_email != $request->user()->email
            ) {
                return response()->json([
                    'error' => true,
                    'message' => 'You do not have the authority to perform this action'
                ], 401);
            }
        }



        $paperJournal = new PaperJournal;
        $paperJournal->paper_id = $request->paper_id;
        $paperJournal->journal_id = $id;
        $paperJournal->save();

        $researcher = User::where('email', $paper->researcher_email)->first();
        $editor = User::where('email', $paper->editor_email)->first();

        if (!$researcher || !$editor)
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
                'editor' => $editor->first_name . " " . $editor->last_name,
                'editor_id' => $editor->id,
                'editor_email' => $editor->email,
                'researcher_email' => $researcher->email
            )
        ]);
    }

    public function removePaperFromJournal(Request $request, $id)
    {
        if ($request->user()->type != 'admin' && $request->user()->type != 'editor')
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);

        $request->validate([
            'paper_id' => 'required|exists:papers,id',
        ]);

        $journal = Journal::find($id);
        $paper = Paper::find($request->paper_id);
        if (!$journal)
            return response()->json([
                'error' => true,
                'message' => 'Journal of id ' . $id . 'not found'
            ], 404);

        $paperJournal = PaperJournal::where('paper_id', $request->paper_id)
            ->where('journal_id', $id)->first();

        if ($paperJournal)
            $paperJournal->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
