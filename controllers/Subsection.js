const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create SubSection

exports.createSubSection = async (req, res) => {
    try{
            //fecth data from Req body
            const {sectionId, title, timeDuration, description} = req.body;
            //extract file/video
            const video  = req.files.videoFile;
            //validation
            if(!sectionId || !title || !timeDuration || !description || !video) {
                return res.status(400).json({
                    success:false,
                    message:'All fields are required',
                });
            }
            //upload video to cloudinary
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            //create a sub-section
            const subSectionDetails = await SubSection.create({
                title:title,
                timeDuration:timeDuration,
                description:description,
                videoUrl:uploadDetails.secure_url,
            })
            //update section with this sub section ObjectId
            const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                        {$push:{
                                                            subSection:subSectionDetails._id,
                                                        }},
                                                        {new:true});

            //HW: log updated section here, after adding populate query
            const populatedSection = updatedSection.populate("subSection");
            console.log(populatedSection);

            //return response
            return res.status(200).json({
                succcess:true,
                message:'Sub Section Created Successfully',
                updatedSection,
            });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
        })
    }
};

//HW: updateSubSection
exports.updateSubSection = async (req,res)=>{
    try{
            //get the details
            const {subSectionId, title, description, timeDuration} = req.body;
            const video = req.files.videoFile;
            
            //validation
            if(!subSectionId || !title || !description || !timeDuration || !video){
                return res.status(400).json({
                    success:true,
                    message: "All details required"
                })
            }

            //upload to cloudinary
            const uploadedVideo = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            // find by id and update
            const updatedDetails = await SubSection.findByIdAndUpdate({_id:subSectionId},
                {
                    title: title,
                    description: description,
                    timeDuration: timeDuration,
                    videoUrl: uploadedVideo.secure_url
                },
                {new:true}
            )
            if(!updatedDetails){
                return res.status(400).json({
                    success:false,
                    message: "SubSection not found"
                })
            }
            //return res
            return res.status(200).json({
                success:true,
                message:"Sub section is updated successfully",
                data: updatedDetails
            })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error: error.message
        })
    }

}

//HW:deleteSubSection