<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEvaluationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->string('answer');
            $table->unsignedBigInteger('metric_id');
            $table->string('reviewer_email');
            $table->unsignedBigInteger('paper_id');
            $table->set('status', ['approved', 'rejected', 'pending']);
            $table->string('editor_comments');
            $table->string('additional_comments');
            $table->timestamps();
            // 
            $table->foreign('metric_id')->references('id')->on('metrics')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('paper_id')->references('id')->on('papers')->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreign('reviewer_email')->references('email')->on('users')->onUpdate('cascade')
                ->onDelete('cascade');
            //
            $table->index(['metric_id','paper_id','reviewer_email']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('evaluations');
    }
}
