<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAssignedTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('assigneds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('paper_id');              
            $table->string('researcher_email');
            $table->string('reviewer_email');
            $table->date('revision_deadline');         
            $table->timestamps();

            // foreign key
            $table->foreign('paper_id')->references('id')->on('papers')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('researcher_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('reviewer_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');

        // primary
            $table->index(['paper_id', 'researcher_email', 'reviewer_email']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('assigned');
    }
}
