import {VerificationState} from "@/types/VerificationState";
import {updateStatus} from "@/app/verify/callback/updateStatus";
import React from "react";


async function SuccessPage({ params }: {params: {id: String}}) {
  await updateStatus(params.id, VerificationState.Failed)

      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="container">
                <div className="bg-white rounded-lg shadow px-5 py-10 text-center">
                    <h1 className="text-4xl font-bold text-red-600">Error</h1>
                    <p className="mt-4 text-lg text-gray-700">There was an error. Please try again later.</p>
                </div>
            </div>
        </div>
    );
}

export default SuccessPage;

