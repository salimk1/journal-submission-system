<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Paper;
use App\Models\User;
use App\Models\Assigned;

class AssignedsController extends Controller
{
    public function assignReviewer(Request $request)
    {
        if ($request->user()->type != 'editor') {
            return response()->json([
                'error' => true,
                'message' => 'You are not alloweed to view this section'
            ], 401);
        }


        $request->validate([
            'paper_id' => 'required|exists:papers,id',
            'researcher_email' => 'required|exists:users,email',
            'reviewer_email' => 'required|exists:users,email',
            'revision_deadline' => 'required|date',
        ]);

        $paper = Paper::find($request->paper_id);

        if (!$paper) {
            return response()->json([
                'error' => true,
                'message' => 'Paper with id ' . $request->paper_id . ' does not exist'
            ], 404);
        }

        $reviewer = User::where('email', $request->reviewer_email)->first();

        if (!$reviewer) {
            return response()->json([
                'error' => true,
                'message' => 'Reviewer with id ' . $request->reviewer_email . ' does not exist'
            ], 404);
        }

        // check if already assigned
        $find_assigned = Assigned::where('paper_id', $request->paper_id)
            ->where('researcher_email', $request->researcher_email)
            ->where('reviewer_email', $request->reviewer_email)->first();
        if ($find_assigned) {
            return response()->json([
                'success' => true,
                'message' => 'The reviewer is already assigned'
            ]);
        }

        // check editor is paper editor
        if ($paper->editor_email != $request->user()->email) {
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);
        }

        $assigned = new Assigned;
        $assigned->paper_id = $request->paper_id;
        $assigned->researcher_email = $request->researcher_email;
        $assigned->reviewer_email = $request->reviewer_email;
        $assigned->revision_deadline = $request->revision_deadline;
        $assigned->save();

        $reviewer = User::where('email', $assigned->reviewer_email)->first();

        return response()->json([
            'success' => true,
            'assigned' => array(
                'paper_id' => $assigned->paper_id,
                'reviewer_id' => $reviewer->id,
                'reviewer' => $reviewer->first_name . ' ' . $reviewer->last_name,
                'reviewer_email' => $assigned->reviewer_email,
                'revision_deadline' => $assigned->revision_deadline
            )
        ]);
    }

    public function removeAssigned(Request $request)
    {
        if ($request->user()->type != 'editor') {
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);
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
            ], 404);
        }

        $reviewer = User::where('email', $request->reviewer_email)->first();

        if (!$reviewer) {
            return response()->json([
                'error' => true,
                'message' => 'Reviewer with id ' . $request->reviewer_email . ' does not exist'
            ], 404);
        }

        if ($paper->editor_email != $request->user()->email) {
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);
        }

        $assigned = Assigned::where('paper_id', $request->paper_id)
            ->where('reviewer_email', $request->reviewer_email)->first();

        if ($assigned)
            $assigned->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function getAllInfo(Request $request)
    {
        if ($request->user()->type != 'editor') {
            return response()->json([
                'error' => true,
                'message' => 'You are not alloweed to view this section'
            ], 401);
        }

        $assigneds = Assigned::join('papers', 'assigneds.paper_id', '=', 'papers.id')->join('users', 'assigneds.reviewer_email', '=', 'users.email')->get();

        return response()->json([
            'assigneds' => $assigneds
        ]);
    }

    public function getAllPapersAssignedToReviewer(Request $request, $id)
    {
        if ($request->user()->type == 'editor' || $request->user()->type == 'reviewer') {
            $rev = User::find($id);
            if (!$rev) {
                return response()->json([
                    'error' => true,
                    'message' => 'User not found'
                ], 404);
            } elseif ($rev->type != 'reviewer') {
                return response()->json([
                    'error' => true,
                    'message' => 'User is not a reviewer'
                ], 422);
            }

            $assigneds = Assigned::join('papers', 'assigneds.paper_id', '=', 'papers.id')->join('users', 'assigneds.reviewer_email', '=', 'users.email')->where('reviewer_email', $rev->email)->get();

            return response()->json([
                'assigneds' => $assigneds
            ]);
        }

        return response()->json([
            'error' => true,
            'message' => 'You are not alloweed to view this section'
        ], 401);
    }

    public function getAllPapersAssignedToResearcher(Request $request, $id)
    {
        if ($request->user()->type == 'editor' || $request->user()->type == 'reviewer') {
            $res = User::find($id);
            if (!$res || $res->type != 'researcher') {
                return response()->json([
                    'error' => true,
                    'message' => 'User not found'
                ], 404);
            }

            $assigneds = Assigned::join('papers', 'assigneds.paper_id', '=', 'papers.id')->join('users', 'assigneds.researcher_email', '=', 'users.email')->where('assigneds.researcher_email', $res->email)->get();

            return response()->json([
                'assigneds' => $assigneds
            ]);
        }

        return response()->json([
            'error' => true,
            'message' => 'You are not alloweed to view this section'
        ], 401);
    }

    public function getReviewersAssignedToPaper(Request $request, $id)
    {
        if ($request->user()->type == 'editor') {
            $paper = Paper::find($id);
            if (!$paper) {
                return response()->json([
                    'error' => true,
                    'message' => 'paper not found'
                ], 404);
            }

            $assigneds = Assigned::join('papers', 'assigneds.paper_id', '=', 'papers.id')->join('users', 'assigneds.reviewer_email', '=', 'users.email')->where('assigneds.paper_id', $paper->id)->get();

            return response()->json([
                'assigneds' => $assigneds,
            ]);
        }

        return response()->json([
            'error' => true,
            'message' => 'You are not alloweed to view this section'
        ], 401);
    }
}
