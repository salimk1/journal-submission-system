<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EvaluationMetric;
use App\Models\Metric;

class EvaluationMetricController extends Controller
{
    public function getAll(Request $request) {
        
        $evaluation_metrics = EvaluationMetric::all();

        return response()->json([
            'success' => true,
            'evaluation_metrics' => $evaluation_metrics
        ]);
    }

    public function createNew(Request $request) {

        if ($request->user()->type != 'admin' && $request->user()->type != 'editor') {
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);
        }

        $request->validate([
            'name' => 'required|string|unique:evaluation_metrics',            
        ]);

        $evaluation_metric = new EvaluationMetric;
        $evaluation_metric->name = $request->name;
        $evaluation_metric->save();

        return response()->json([
            'success' => true,
            'evaluation_metric' => $evaluation_metric
        ]);

    }

    public function getById(Request $request, $id) {

        $evaluation_metric = EvaluationMetric::find($id);

        if (!$evaluation_metric) 
            return response()->json([
                'error' => true,
                'message' => 'Evaluation Metric not found'
            ]);

        $metric_questions = Metric::where('em_id', $id)->get();
        
        return response()->json([
            'evaluation_metric' => $evaluation_metric,
            'metrics' => $metric_questions
        ]);
    }

    public function editById(Request $request, $id) {
        $evaluation_metric = EvaluationMetric::find($id);

        if (!$evaluation_metric) 
            return response()->json([
                'error' => true,
                'message' => 'Evaluation Metric not found'
            ]);

        $request->validate([
            'name' => 'string|exclude_if:name,'.$evaluation_metric->name.'|unique:evaluation_metrics',
        ]);

        if ($request->has('name'))  
            $evaluation_metric->name = $request->name;

        $evaluation_metric->save();

        return response()->json([
            'success' => true
        ]);
    }

    public function addQuestion(Request $request, $id) {

        if ($request->user()->type != 'admin' && $request->user()->type != 'editor') {
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);
        }

        $evaluation_metric = EvaluationMetric::find($id);

        if (!$evaluation_metric) 
            return response()->json([
                'error' => true,
                'message' => 'Evaluation Metric not found'
            ]);
            
        $request->validate([
            'question' => 'string',
            'answer_type' => 'in:scale,comment'
        ]);

        $metric;
        if ($request->has('id') && !fnmatch('new*' , $request->id))
            $metric = Metric::find($request->id);
        else
            $metric = new Metric;

        $metric->question = $request->question;
        $metric->answer_type = $request->answer_type;
        $metric->em_id = $id;
        $metric->save();

        return response()->json([
            'success' => true,
            'metric' => $metric
        ]);
    }

    public function removeQuestion(Request $request, $id) {
        if ($request->user()->type != 'admin' && $request->user()->type != 'editor') {
            return response()->json([
                'error' => true,
                'message' => 'You do not have the authority to perform this action'
            ], 401);
        }

        $evaluation_metric = EvaluationMetric::find($id);

        if (!$evaluation_metric) 
            return response()->json([
                'error' => true,
                'message' => 'Evaluation Metric not found'
            ]);
            
        $request->validate([
            'metric_id' => 'integer|exists:metrics,id',            
        ]);
        
        $metric = Metric::find($request->metric_id);

        if (!$metric)
            return response()->json([
                'error' => true,
                'message' => 'No metric found with given id'
            ]);
        
        $metric->delete();
        
        return response()->json([
            'success' => true,
            'metric' => $metric
        ]);
    }
}
