<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDegreesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('degrees', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('institution');      // not in og relation
            $table->date('received');           // not in og relation
            $table->string('researcher_email');
            $table->foreign('researcher_email')->references('email')->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->index(['title','institution','researcher_email']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('degrees');
    }
}
