import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { Loader2, Layout, Image, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CareerPageBuilder = ({ company }) => {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        slug: company?.customCareerPage?.slug || '',
        aboutUs: company?.customCareerPage?.aboutUs || '',
        culture: company?.customCareerPage?.culture || '',
        benefits: company?.customCareerPage?.benefits ? company.customCareerPage.benefits.join(', ') : '',
        file: null
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const fileChangeHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("slug", input.slug);
        formData.append("aboutUs", input.aboutUs);
        formData.append("culture", input.culture);
        // split benefits string to array
        const benefitsArr = input.benefits.split(',').map(b => b.trim()).filter(b => b !== '');
        formData.append("benefits", JSON.stringify(benefitsArr));

        if (input.file) {
            formData.append("file", input.file); // Banner image
        }

        try {
            setLoading(true);
            const res = await axiosInstance.put(`${COMPANY_API_END_POINT}/${company._id}/career-page`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to update career page");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Layout className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Custom Career Page Builder</h2>
                </div>
                {company?.customCareerPage?.slug && (
                    <Link to={`/h/${company.customCareerPage.slug}`} target="_blank">
                        <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white">
                            View Public Page <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                )}
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
                <div>
                    <Label>Custom URL Slug</Label>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground bg-secondary px-3 py-2 rounded-lg border border-border">hirehub.com/h/</span>
                        <Input
                            name="slug"
                            value={input.slug}
                            onChange={changeEventHandler}
                            placeholder="my-company"
                            className="flex-1"
                        />
                    </div>
                </div>

                <div>
                    <Label>Banner Image</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={fileChangeHandler}
                        className="mt-2"
                    />
                    {company?.customCareerPage?.banner && !input.file && (
                        <p className="text-xs text-muted-foreground mt-2">Current banner is active.</p>
                    )}
                </div>

                <div>
                    <Label>About Us</Label>
                    <Textarea
                        name="aboutUs"
                        value={input.aboutUs}
                        onChange={changeEventHandler}
                        placeholder="Tell candidates about your company mission and vision..."
                        className="mt-2 min-h-[100px]"
                    />
                </div>

                <div>
                    <Label>Company Culture</Label>
                    <Textarea
                        name="culture"
                        value={input.culture}
                        onChange={changeEventHandler}
                        placeholder="What is it like to work at your company?"
                        className="mt-2 min-h-[100px]"
                    />
                </div>

                <div>
                    <Label>Benefits (Comma separated)</Label>
                    <Input
                        name="benefits"
                        value={input.benefits}
                        onChange={changeEventHandler}
                        placeholder="e.g., Remote Work, Health Insurance, 401k, Gym Membership"
                        className="mt-2"
                    />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Career Page
                </Button>
            </form>
        </div>
    );
};

export default CareerPageBuilder;
