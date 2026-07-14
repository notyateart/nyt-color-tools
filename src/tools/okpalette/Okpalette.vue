<template>
    <section class="space-y-8">

        <header>
            <h2 class="text-3xl font-bold">
                OK Palette
            </h2>

            <p class="text-gray-600 mt-4 mb-2">
                Generate perceptually uniform OKLCH color palettes.
            </p>

            <hr class="border-slate-300" />
        </header>


        <!-- Inputs -->

        <form class="grid gap-6 sm:grid-cols-2 max-w-5xl">


            <!-- Lightness -->

            <fieldset class="space-y-3 border rounded p-4">

                <legend class="font-semibold px-2">
                    Lightness
                </legend>


                <label class="text-sm">
                    Top
                </label>

                <input
                    v-model.number="lightnessTop"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    class="w-full px-3 py-2 border rounded"
                />


                <label class="text-sm">
                    Bottom
                </label>

                <input
                    v-model.number="lightnessBottom"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    class="w-full px-3 py-2 border rounded"
                />


                <label class="text-sm">
                    Steps
                </label>

                <input
                    v-model.number="steps"
                    type="number"
                    min="2"
                    max="30"
                    class="w-full px-3 py-2 border rounded"
                />

            </fieldset>



            <!-- Chroma -->

            <fieldset class="space-y-4 border rounded p-4">

                <legend class="font-semibold px-2">
                    Chroma
                </legend>


                <label class="text-sm">
                    Start
                </label>

                <input
                    v-model.number="chromaStart"
                    type="number"
                    step="0.0025"
                    class="w-full px-3 py-2 border rounded"
                />


                <label class="text-sm">
                    End
                </label>

                <input
                    v-model.number="chromaEnd"
                    type="number"
                    step="0.0025"
                    class="w-full px-3 py-2 border rounded"
                />


                <label class="text-sm">
                    Curve
                </label>

                <select
                    v-model="chromaCurve"
                    class="border rounded px-3 py-2"
                >
                    <option value="linear">
                        Linear
                    </option>

                    <option value="ease">
                        Ease In / Out
                    </option>
                </select>



                <div class="border-t pt-3 space-y-3">

                    <div class="flex justify-between">
                        <span class="font-medium">
                            Middle Points
                        </span>

                        <button
                            type="button"
                            @click="addChromaPoint"
                            class="px-2 py-1 bg-gray-200 rounded text-sm"
                        >
                            + Add
                        </button>
                    </div>



                    <div
                        v-for="(point,index) in chromaPoints"
                        :key="index"
                        class="space-y-2"
                    >

                        <div class="text-sm">
                            Point {{ index + 1 }}
                        </div>


                        <input
                            v-model.number="point.step"
                            type="range"
                            min="1"
                            :max="steps-2"
                            class="w-full"
                        />

                        <div class="text-xs text-gray-500">
                            Step {{ point.step }}
                        </div>


                        <input
                            v-model.number="point.value"
                            type="number"
                            step="0.0025"
                            class="w-full px-3 py-2 border rounded"
                        />


                        <button
                            type="button"
                            @click="removeChromaPoint(index)"
                            class="text-red-500 text-sm"
                        >
                            Remove
                        </button>

                    </div>

                </div>


            </fieldset>




            <!-- Hue -->

            <fieldset
                class="sm:col-span-2 border rounded p-4 space-y-3"
            >

                <legend class="font-semibold px-2">
                    Hue List
                </legend>


                <input
                    v-model="hueInput"
                    class="w-full px-3 py-2 border rounded font-mono"
                    placeholder="240"
                />


                <p class="text-sm text-gray-500">
                    Comma-separated hue values.
                </p>

            </fieldset>


        </form>




        <!-- Palette -->


        <div class="space-y-8">


            <div
                v-for="column in palette"
                :key="column.hue"
            >

                <h3 class="font-semibold mb-3">
                    {{ column.hue }}°
                </h3>



                <div
                    class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3"
                >


                    <div
                        v-for="color in column.colors"
                        :key="color.oklch"
                        class="h-36 rounded shadow border flex flex-col justify-end p-2 text-xs font-mono"
                        :style="{
                            background: color.oklch
                        }"
                    >


                        <span
                            class="cursor-pointer hover:underline"
                            :style="{
                                color: color.text
                            }"
                            @click="copy(color.oklch)"
                        >
                            {{ color.oklch }}
                        </span>


                        <span
                            class="opacity-70"
                            :style="{
                                color: color.text
                            }"
                        >
                            APCA:
                            {{
                                color.text === '#000'
                                ? color.contrast.black
                                : color.contrast.white
                            }}
                        </span>


                    </div>


                </div>

            </div>


        </div>




        <div
            v-if="toast"
            class="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow"
        >
            {{ toast }}
        </div>


    </section>
</template>



<script setup lang="ts">

import { computed, ref } from "vue";
import Color from "colorjs.io";



const lightnessTop = ref(98);
const lightnessBottom = ref(18);
const steps = ref(12);



const chromaStart = ref(0.02);
const chromaEnd = ref(0.04);


const chromaPoints = ref([
    {
        step: 6,
        value: 0.18
    }
]);


const chromaCurve = ref<"linear"|"ease">(
    "ease"
);



const hueInput = ref("240");

const toast = ref("");





const palette = computed(() => {


    const lightnesses =
        generateLightness(
            lightnessTop.value,
            lightnessBottom.value,
            steps.value
        );


    const chromas =
        generateChroma(
            steps.value,
            chromaStart.value,
            chromaEnd.value,
            chromaPoints.value,
            chromaCurve.value
        );


    const hues =
        hueInput.value
        .split(",")
        .map(Number)
        .filter(v => !Number.isNaN(v));



    return hues.map(hue => ({

        hue,

        colors:

            lightnesses.map((l,i)=>{


                const css =
                    `oklch(${l.toFixed(1)}% ${chromas[i].toFixed(3)} ${hue})`;


                return {

                    oklch: css,

                    text:
                        getTextColor(css),

                    contrast:
                        getContrast(css)

                };

            })

    }));

});







function generateLightness(
    top:number,
    bottom:number,
    steps:number
){

    return Array.from(
        {length:steps},
        (_,i)=>
            top+(bottom-top)*(i/(steps-1))
    );

}







function generateChroma(
    steps:number,
    start:number,
    end:number,
    points:{
        step:number,
        value:number
    }[],
    curve:"linear"|"ease"
){


    const stops = [

        {
            step:0,
            value:start
        },

        ...points.sort(
            (a,b)=>a.step-b.step
        ),

        {
            step:steps-1,
            value:end
        }

    ];



    return Array.from(
        {length:steps},
        (_,i)=>{


            const left =
                [...stops]
                .reverse()
                .find(
                    p=>p.step<=i
                )!;



            const right =
                stops.find(
                    p=>p.step>=i
                )!;



            if(left.step===right.step)
                return left.value;



            let t =
                (i-left.step) /
                (right.step-left.step);



            if(curve==="ease")
                t=easeInOut(t);



            return (
                left.value+
                (right.value-left.value)*t
            );


        }
    );


}






function easeInOut(t:number){

    return t<0.5
        ? 2*t*t
        : 1-Math.pow(-2*t+2,2)/2;

}







function getTextColor(bg:string){


    const color =
        new Color(bg);


    const black =
        Math.abs(
            color.contrast(
                "black",
                "APCA"
            )
        );


    const white =
        Math.abs(
            color.contrast(
                "white",
                "APCA"
            )
        );


    return black>white
        ? "#000"
        : "#fff";

}







function getContrast(bg:string){

    const color =
        new Color(bg);


    return {

        black:
            color.contrast(
                "black",
                "APCA"
            ).toFixed(1),


        white:
            color.contrast(
                "white",
                "APCA"
            ).toFixed(1)

    };

}







function addChromaPoint(){

    chromaPoints.value.push({

        step:
            Math.floor(steps.value/2),

        value:
            chromaStart.value

    });

}



function removeChromaPoint(index:number){

    chromaPoints.value.splice(
        index,
        1
    );

}







async function copy(value:string){

    await navigator.clipboard.writeText(value);

    toast.value="Copied!";


    setTimeout(()=>{
        toast.value="";
    },1500);

}


</script>