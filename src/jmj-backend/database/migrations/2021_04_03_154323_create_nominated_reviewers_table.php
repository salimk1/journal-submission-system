<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNominatedReviewersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nominated_reviewers', function (Blueprint $table) {
            $table->id();                       
            $table->unsignedBigInteger('paper_id');              
            $table->string('researcher_email');
            $table->string('reviewer_email');
            $table->timestamps();

            // foreign key
            $table->foreign('paper_id')->references('id')->on('papers')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('researcher_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('reviewer_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');

            // index
            $table->index(['paper_id', 'researcher_email', 'reviewer_email'], 'nr_index');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nominated_reviewers');
    }
}
