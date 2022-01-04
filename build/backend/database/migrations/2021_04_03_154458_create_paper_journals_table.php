<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaperJournalsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('paper_journals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('paper_id');              
            $table->unsignedBigInteger('journal_id');
            $table->timestamps();

            //
            $table->foreign('paper_id')->references('id')->on('papers')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('journal_id')->references('id')->on('journals')->onUpdate('cascade')
            ->onDelete('cascade');            

            //
            $table->index(['paper_id', 'journal_id'], 'paper_journals_index'); 
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('paper_journals');
    }
}
