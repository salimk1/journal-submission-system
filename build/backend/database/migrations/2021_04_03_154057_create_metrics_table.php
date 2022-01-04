<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMetricsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('metrics', function (Blueprint $table) {
            $table->id();
            $table->string('question');             
            $table->set('answer_type', ['scale', 'comment']);
            $table->unsignedBigInteger('em_id'); // Evaluation metric id
            $table->timestamps();

            $table->foreign('em_id')->references('id')->on('evaluation_metrics')->onUpdate('cascade')->onDelete('cascade');
            $table->index(['question','em_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('metrics');
    }
}
