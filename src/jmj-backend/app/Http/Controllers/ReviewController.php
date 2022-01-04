<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;

class ReviewController extends Controller
{
    public function getReviewsForPaper(Request $request, $id)
    {
        if ($request->user()->type == 'viewer')
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);

        $review = Review::where('paper_id', $id)->get();

        return response()->json([
            'reviews' => $review
        ]);
    }

    public function approveRejectReview(Request $request, $id)
    {
        if ($request->user()->type != 'editor' && $request->user()->type != 'admin')
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);

        $request->validate([
            'status' => 'required|string',
        ]);

        $review = Review::find($id);

        $review->status = $request->status;
        $review->save();

        return response()->json([
            'review' => $review
        ]);
    }
}
