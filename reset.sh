
 pm2 stop 0
 npm rebuild
 pm2 start 0
 pm2 status
 
RESETDIR="uploads"
#RESETDIR /home/ec2-user/golf-upload/
# /home/ec2-user/golf-upload/uploads/
mv "${RESETDIR}"/bridgestone/*.jpeg "${RESETDIR}"
mv "${RESETDIR}"/callaway/*.jpeg "${RESETDIR}"
mv "${RESETDIR}"/uploads/mizuno/*.jpeg "${RESETDIR}"
mv "${RESETDIR}"/uploads/nitro/*.jpeg "${RESETDIR}"
mv "${RESETDIR}"/uploads/pinnacle/*.jpeg "${RESETDIR}"
mv "${RESETDIR}"/uploads/srixon/*.jpeg ${RESETDIR}"
mv "${RESETDIR}"/uploads/taylormade/*.jpeg ${RESETDIR}"
mv "${RESETDIR}"/uploads/titleist/*.jpeg ${RESETDIR}"
mv "${RESETDIR}"/uploads/top-flite/*.jpeg ${RESETDIR}"
mv "${RESETDIR}"/uploads/vice/*.jpeg ${RESETDIR}"
mv "${RESETDIR}"/uploads/vice-pro/*.jpeg ${RESETDIR}"
mv "${RESETDIR}"/uploads/volvik/*.jpeg ${RESETDIR}"
mv "${RESETDIR}"/uploads/wilson/*.jpeg ${RESETDIR}"