const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const config = require('config');


//get my profile
router.get('/me', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
  
      if (!profile) return res.status(400).json({ msg: 'There is no profile for this user' });
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


//create or update user profile
router.post('/',[ auth, [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty() ]],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

      const profileFields = {}
      profileFields.user = req.user.id
      if(company) profileFields.company  = company;
      if(location) profileFields.location  = location;
      if(website) profileFields.website  = website;
      if(bio) profileFields.bio  = bio;
      if(status) profileFields.status  = status;
      if(githubusername) profileFields.githubusername  = githubusername;
      if(skills) profileFields.skills  = skills.split(',').map( skill => skill.trim())

      profileFields.social = {}
      if(youtube) profileFields.social.youtube  = youtube;
      if(twitter) profileFields.social.twitter = twitter;
      if(instagram) profileFields.social.instagram  = instagram;
      if(linkedin) profileFields.social.linkedin  = linkedin;
      if(facebook) profileFields.social.facebook  = facebook;


      try {
          let profile = await Profile.findOne({ user: req.user.id })
          if(profile){
              profile = await Profile.findOneAndUpdate({user: req.user.id} ,{ $set: profileFields },
                { new: true })
                return res.json(profile)
          }
          profile = new Profile(profileFields)
          await profile.save()
          res.json(profile)
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }

    });


// get all profiles 
router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });




// get profile by user_id
router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name','avatar']);
        res.json(profile);

        if(!profile) return res.status(400).json({msg : 'No Profile found for this user'});
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') return res.status(400).json({msg : 'No Profile found for this user'});
        res.status(500).send('Server Error');
    }
});

// delete user and profile
router.delete('/', auth, async (req,res) => {
    try {
        //delete  profile
        await Profile.findOneAndRemove({ user: req.user.id })
        //delete user
        await User.findOneAndRemove({ _id: req.user.id })
        res.json({ msg: 'User Deleted'});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error...');
    }
});

// add experience
router.put('/experience', [ auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()] ] , 
    async (req,res) => { const errors = validationResult(req)
    if(!errors) return res.status(400).json({ errors : errors.array })

    const { title, company, location, from, to, current , description } = req.body;
    const newExp = { title, company, location, from, to, current , description }
    try {
       const profile = await Profile.findOne({ user : req.user.id })
       profile.experience.unshift(newExp)
       await profile.save()
       res.json(profile);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error...')}
});

// delete exp
router.delete('/experience/:exp_id', auth , async (req,res) => {
    try {
        const profile = await Profile.findOne({ user : req.user.id })
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex,1)
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error...')
        
    }
});

// add education
router.put('/education', [ auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degreee is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
] ] , async (req,res) => {
    const errors = validationResult(req)
    if(!errors) return res.status(400).json({ errors : errors.array })

    const {school, degree, fieldofstudy,from, to, description } = req.body;
    const newEdu = {school, degree, fieldofstudy,from,to, description }
    try {
       const profile = await Profile.findOne({ user : req.user.id })
       profile.education.unshift(newEdu)
       await profile.save()
       res.json(profile);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error...')
        
    }
});

// delete education
router.delete('/education/:edu_id', auth , async (req,res) => {
    try {
        const profile = await Profile.findOne({ user : req.user.id })
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)
        profile.education.splice(removeIndex,1)
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error...')
        
    }
});

module.exports = router;